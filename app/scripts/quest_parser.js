/* Parses quest syntax and traverses it as a player would.
   Returns objects of the type:
   {'type', 'icon', 'title', 'contents'}
   where all arguments except 'type' are optional.
   See quests/quest_spec.txt for specification.
*/

var questParser = function() {
  this.path = [];
  this.root = null;
  return this;
};

questParser.prototype.init = function(root) {
  if (root === undefined) {
    throw new Error("Quest has invalid root node");
  }
  this.root = root;

  var badEntries = this._getInvalidNodesAndAttributes(root);
  if (!this._isEmptyObject(badEntries)) {
    throw new Error("Found invalid nodes and attributes: " + JSON.stringify(badEntries));
  }

  var duplicateIDs = this._getDuplicateIds(root);
  if (!this._isEmptyObject(duplicateIDs)) {
    throw new Error("Found nodes with duplicate ids: " + JSON.stringify(duplicateIDs));
  }

  // TODO(scott): Add check for proper resolution of combat enemies

  this._parser = math.parser();

  this.path = [root.children[0]];
  return this._loadCurrentNode();
};

questParser.prototype.setGameState = function(state) {
  if (!this._parser) {
    return;
  }
  this._parser.eval('_gamestate_ = ' + JSON.stringify(state));
  // TODO: Include helper functions for accessing game state vars
};

questParser.prototype.isStarted = function() {
  return (this.path.length > 1);
};

// The passed event parameter is a string indicating which event to fire based on the "on" attribute.
questParser.prototype.handleEvent = function(event) {
  var parent = this.path[this.path.length - 1];
  var child = this._loopChildren(parent, function(tag, c) {
    if (c.getAttribute('on') === event && this._isEnabled(c)) {
      return c;
    }
  }.bind(this));

  if (!child) {
    throw new Error("Could not find child with on='"+event+"'");
  }
  this.path.push(child);
  return this._loadCurrentNode();
};

// The passed choice parameter is an number indicating the choice number in the XML element, including conditional choices.
questParser.prototype.handleChoice = function(choice) {
  var parent = this.path[this.path.length - 1];

  // Scan the parent node to find the choice with the right number
  var idx = 0;
  var choiceIdx = -1;
  for (; idx < parent.children.length; idx++) {
    if (parent.children[idx].localName === "choice") {
      choiceIdx++;
    }

    // When we find our choice, push it onto the stack and load it.
    if (choiceIdx === choice) {
      this.path.push(parent.children[idx]);
      return this._loadCurrentNode();
    }
  }

  // This happens on lookup error or default "Next"/"End" event
  if (this._loopChildren(parent, function(tag) { if (tag === "end") return true; })) {
    return this._loadEndNode();
  }
  this.path.push(this._findNextNode(parent));
  return this._loadCurrentNode();
};

questParser.prototype.back = function() {
  if (this.path.length <= 1) {
    return null;
  }

  // Pop the most recent node, as well as all preceding choice nodes
  // until we come to something we can actually display.
  // Operations are also skipped (don't want back button to have side effects)
  do {
    this.path.pop();
  } while (this._isControlNode(this.path[this.path.length-1]) || !this._isEnabled(this.path[this.path.length-1]) || this.path[this.path.length-1].localName === "op");

  return this._loadCurrentNode();
};

questParser.prototype._loadCurrentNode = function() {
  var node = this.path[this.path.length - 1];
  switch(node.localName) {
    case "op":
      return this._loadOpNode(node);
    case "choice":
      return this._loadChoiceNode(node);
    case "event":
      return this._loadEventNode(node);
    case "combat":
      return this._loadCombatNode(node);
    case "roleplay":
      return this._loadDialogNode(node);
    case "trigger":
      return this._loadTriggerNode(node);
    case "comment":
      this.path.push(this._findNextNode(node));
      return this._loadCurrentNode();
    default:
      throw new Error("Unknown node name: " + node.localName);
  }
};

questParser.prototype._loadOpNode = function(node) {
  this._parser.eval(node.textContent);

  // After evaluation, move on to the next node.
  this.path.push(this._findNextNode(node));
  return this._loadCurrentNode();
};

questParser.prototype._loadChoiceNode = function(node) {
  // The action on a choice node is functionally the same as an event node.
  return this._loadEventNode(node);
};

questParser.prototype._loadEventNode = function(node) {
  // If event is empty and has a goto, jump to the destination element with that id.
  if (node.children.length === 0 && node.hasAttribute('goto')) {
    this.path.push(this.root.querySelector("#"+node.getAttribute('goto')));
    return this._loadCurrentNode();
  }

  // Validate the event node (must not have an event child and must control something)
  var hasControlChild = false;
  this._loopChildren(node, function(tag) {
    if (tag === 'event' | tag === 'choice') {
      throw new Error("Node cannot have <event> or <choice> child");
    }

    if (tag === 'combat' || tag === 'trigger' || tag === 'roleplay') {
      hasControlChild = true;
    }
  });
  if (!hasControlChild) {
    throw new Error("Node without goto attribute must have at least one of <combat> or <roleplay>");
  }

  // Dive in to the first element.
  this.path.push(node.children[0]);
  return this._loadCurrentNode();
};

questParser.prototype._loadCombatNode = function(node) {
  var combat = [];

  // Track win and lose events for validation
  var winEventCount = 0;
  var loseEventCount = 0;
  this._loopChildren(node, function(tag, c) {
    switch (tag) {
      case 'e':
        combat.push({name: c.textContent});
        break;
      case 'event':
      case 'roleplay':
        winEventCount += (c.getAttribute('on') === 'win' && this._isEnabled(c)) ? 1 : 0;
        loseEventCount += (c.getAttribute('on') === 'lose' && this._isEnabled(c)) ? 1 : 0;
        break;
      default:
        throw new Error("Invalid child element: " + tag);
    }
  }.bind(this));

  if (winEventCount === 0) {
    throw new Error("<combat> must have at least one conditionally true child with on='win'");
  }

  if (loseEventCount === 0) {
    throw new Error("<combat> must have at least one conditionally true child with on='lose'");
  }

  if (!combat.length) {
    throw new Error("<combat> has no <e> children");
  }

  // TODO: Add modifiable combat scope.

  return {
    'type': 'combat',
    'icon': node.getAttribute('icon'),
    'contents': combat
  };
};

questParser.prototype._loadTriggerNode = function(node) {
  return {
    type: node.textContent
  };
};

questParser.prototype._isEnabled = function(node) {
  // Comments are never visible.
  if (node.localName === "comment") {
    return false;
  }

  // We check for truthiness here, so nonzero numbers are true, etc.
  return !node.hasAttribute('if') || this._parser.eval("boolean(" + node.getAttribute('if') + ")");
};

questParser.prototype._loadDialogNode = function(node) {
  // Append elements to contents
  var numEvents = 0;
  var child;
  var contents = document.createElement('span');

  // Keep track of the number of choice nodes seen, so we can
  // select a choice without worrying about the state of the quest scope.
  var idx = -1;

  this._loopChildren(node, function(tag, c) {
    c = c.cloneNode(true);

    if (tag === "choice") {
      idx++;
    }

    // Skip elements that aren't visible
    if (!this._isEnabled(c)) {
      return;
    }

    // TODO(scott): Deep-parse all operations inside the dialog and convert them into
    // their values.

    // Convert "choice" tags to <expedition-button> tags
    if (tag === "choice") {
      if (!c.hasAttribute('text')) {
        throw new Error("<choice> inside <roleplay> must have 'text' attribute");
      }
      var text = c.getAttribute('text');
      c = document.createElement('expedition-button');
      c.setAttribute('data-choice', idx);
      Polymer.dom(c).textContent = text;
      numEvents++;
    }

    if (tag === "event") {
      throw new Error("<roleplay> cannot contain <event>.");
    }

    // Convert "instruction" tags to <expedition-indicator> tags.
    if (tag === "instruction") {
      var inner = document.createElement('span');
      inner.innerHTML = c.innerHTML;
      c = document.createElement('expedition-indicator');
      c.setAttribute('icon', 'adventurer');
      Polymer.dom(c).appendChild(inner);
    }

    contents.appendChild(c);
  }.bind(this));

  // Append a generic "Next" button if there were no events,
  // or an "End" button if there's also an <End> tag.
  if (numEvents === 0) {
    // Handle custom generic next button text based on if we're heading into a trigger node.
    var nextNode = this._findNextNode(node);
    var buttonText = "Next";
    if (nextNode && nextNode.localName === "trigger") {
      switch(nextNode.textContent.toLowerCase()) {
        case "end":
          buttonText = "End";
          break;
        default:
          throw new Error("Unknown trigger content " + nextNode.textContent);
      }
    }
    child = document.createElement('expedition-button');
    Polymer.dom(child).innerHTML = buttonText;
    contents.appendChild(child);
  }

  return {
    'type': 'dialog',
    'title': node.getAttribute('title'),
    'icon': node.getAttribute('icon'),
    'contents': contents
  };
};

questParser.prototype._isControlNode = function(node) {
  return node.localName === "choice" || node.localName === "event" || node.hasAttribute('on');
};

questParser.prototype._findNextNode = function(node) {
  while (true) {
    var sibling = node.nextElementSibling;

    // Skip control elements and conditionally false elements
    if (sibling !== null && !this._isControlNode(sibling) && this._isEnabled(sibling)) {
      return sibling;
    }

    // Continue searching neighbors if we have neighbors, otherwise
    // search in the parent node.
    if (sibling !== null) {
      node = sibling;
    } else {
      node = node.parentNode;
    }
  }
};

questParser.prototype._loopChildren = function(node, cb) {
  for (var i = 0; i < node.children.length; i++) {
    var v = cb(node.children[i].localName, node.children[i]);
    if (v !== undefined) {
      return v;
    }
  }
};

// Validate this node and all children for invalid tags.
// Returns a map of tagName->count of the invalid elements found.
questParser.prototype._getInvalidNodesAndAttributes = function(node) {
  var results = {};

  // Quests must only contain these tags:
  if (["op", "quest", "div", "span", "b", "i", "choice", "event", "combat", "roleplay", "p", "e", "em",
       "trigger", "comment", "instruction"].indexOf(
        node.tagName) === -1) {
    results[node.tagName] = (results[node.tagName] || 0) + 1;
  }

  for (var i = 0; i < node.attributes.length; i++) {
    // All HTML event handlers are prefixed with 'on'.
    // See http://www.w3schools.com/tags/ref_eventattributes.asp
    // We use just 'on' without any extras, which is not used by HTML for event handling.
    if (node.attributes[i].name.indexOf('on') === 0 && node.attributes[i].name !== "on") {
      var k = node.tagName + '.' + node.attributes[i];
      results[k] = (results[k] || 0) + 1;
    }
  }

  var mergeResults = function(k) {
    results[k] = (results[k] || 0) + this[k];
  };
  for (i = 0; i < node.children.length; i++) {
    var v = this._getInvalidNodesAndAttributes(node.children[i]);
    Object.keys(v).forEach(mergeResults.bind(v));
  }
  return results;
};

// Validate this node and all children for duplicate IDs.
// Returns a map of id->[element] of all duplicate elements with the same IDs.
questParser.prototype._getDuplicateIds = function(node) {
  var map = this._generateIdMapping(node);

  var results = {};
  Object.keys(map).forEach(function(k) {
    if (map[k].length > 1) {
      results[k] = map[k];
    }
  });

  return results;
};

// Builds and returns a map of all IDs to all nodes with that ID.
questParser.prototype._generateIdMapping = function(node) {
  var map = {};
  if (node.hasAttribute("id")) {
    var id = node.getAttribute("id");
    map[id] = (map[id] || []).concat([node.localName]);
  }

  var mergeResults = function(k) {
    map[k] = (map[k] || []).concat(this[k]);
  };
  for (var i = 0; i < node.children.length; i++) {
    var m = this._generateIdMapping(node.children[i]);
    Object.keys(m).forEach(mergeResults.bind(m));
  }
  return map;
};

questParser.prototype._isEmptyObject = function(obj) {
  return Object.keys(obj).length === 0 && JSON.stringify(obj) === JSON.stringify({});
};