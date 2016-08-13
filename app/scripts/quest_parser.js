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

  console.log("Checking for bad entries");
  var badEntries = this._getInvalidNodesAndAttributes(root);
  if (!this._isEmptyObject(badEntries)) {
    throw new Error("Found invalid nodes and attributes: " + JSON.stringify(badEntries));
  }

  console.log("Checking duplicate IDs");
  var duplicateIDs = this._getDuplicateIds(root);
  if (!this._isEmptyObject(duplicateIDs)) {
    throw new Error("Found nodes with duplicate ids: " + JSON.stringify(duplicateIDs));
  }

  // TODO(scott): Add check for proper resolution of encounter enemies

  this.path = [root.children[0]];
  return this._loadCurrentNode();
};

questParser.prototype.isStarted = function() {
  return (this.path.length > 1);
};

// The passed event parameter is either:
// - An integer indicating the index of the event in the parent element.
// - A string indicating which event to fire based on the "on" attribute.
questParser.prototype.handleEvent = function(event) {
  var parent = this.path[this.path.length - 1];

  if (typeof event === "number") {
    if (!parent.children[event] || parent.children[event].localName !== "event") {
      // Happens on lookup error or default "Next"/"End" event
      if (this._loopChildren(parent, function(tag) { if (tag === "end") return true; })) {
        return this._loadEndNode();
      }
      this.path.push(this._findNextNode(parent));
    } else {
      this.path.push(parent.children[event]);
    }
  } else if (typeof event === "string") { // event is string
    var child = this._loopChildren(parent, function(tag, c) {
      if (c.hasAttribute('on') && c.getAttribute('on') == event) {
        return c;
      }
    });

    if (!child) {
      throw new Error("Could not find child with on='"+event+"'");
    }

    this.path.push(child);
  } else {
    throw new Error("Invalid event type " + (typeof event));
  }
  return this._loadCurrentNode();
};

questParser.prototype.back = function() {
  if (this.path.length <= 1) {
    return null;
  }

  // Pop the most recent node, as well as all preceding event nodes
  // until we come to something we can actually display.
  do {
    this.path.pop();
  } while (this.path[this.path.length-1].localName === "event");

  return this._loadCurrentNode();
};

questParser.prototype._loadCurrentNode = function() {
  var node = this.path[this.path.length - 1];
  switch(node.localName) {
    case "event":
      return this._loadEventNode(node);
    case "encounter":
      return this._loadEncounterNode(node);
    case "roleplay":
      return this._loadDialogNode(node);
    case "end":
      return this._loadEndNode(node);
    case "comment":
      this.path.push(this._findNextNode(node));
      return this._loadCurrentNode();
    default:
      throw new Error("Unknown node name: " + node.localName);
  }
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
    if (tag === 'event') {
      throw new Error("<event> node cannot have <event> child");
    }

    if (tag === 'encounter' || tag === 'end' || tag === 'roleplay') {
      hasControlChild = true;
    }
  });
  if (!hasControlChild) {
    throw new Error("<event> without goto attribute must have at least one of <encounter> or <roleplay>");
  }

  // Dive in to the first element.
  this.path.push(node.children[0]);
  return this._loadCurrentNode();
};

questParser.prototype._loadEncounterNode = function(node) {
  var encounter = [];

  // Track win and lose events for validation
  var winEventCount = 0;
  var loseEventCount = 0;
  this._loopChildren(node, function(tag, c) {
    switch (tag) {
      case 'e':
        encounter.push({name: c.textContent});
        break;
      case 'event':
      case 'roleplay':
        winEventCount += (c.getAttribute('on') === 'win') ? 1 : 0;
        loseEventCount += (c.getAttribute('on') === 'lose') ? 1 : 0;
        break;
      default:
        throw new Error("Invalid child element: " + tag);
    }
  });

  if (winEventCount !== 1) {
    throw new Error("<encounter> must have exactly one child with on='win'");
  }

  if (loseEventCount !== 1) {
    throw new Error("<encounter> must have exactly one child with on='lose'");
  }

  if (!encounter.length) {
    throw new Error("<encounter> has no <e> children");
  }

  return {
    'type': 'encounter',
    'icon': node.getAttribute('icon'),
    'contents': encounter
  };
};

questParser.prototype._loadEndNode = function(node) {
  return {
    type: 'end'
  };
};

questParser.prototype._loadDialogNode = function(node) {
  // Append elements to contents
  var numEvents = 0;
  var hasEndNode = false;
  var child;
  var contents = document.createElement('span');
  this._loopChildren(node, function(tag, c) {
    c = c.cloneNode(true);

    // Convert "event" tags to <expedition-button> tags
    if (tag === "event") {
      if (!c.hasAttribute('text')) {
        throw new Error("<event> inside <roleplay> must have 'text' attribute");
      }
      var text = c.getAttribute('text');
      c = document.createElement('expedition-button');
      Polymer.dom(c).textContent = text;
      numEvents++;
    }

    if (tag === "end") {
      hasEndNode = true;
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
  });

  // Append a generic "Next" button if there were no events,
  // or an "End" button if there's also an <End> tag.
  if (numEvents === 0) {
    child = document.createElement('expedition-button');
    Polymer.dom(child).innerHTML = (hasEndNode) ? "End" : "Next";
    contents.appendChild(child);
  }

  return {
    'type': 'dialog',
    'title': node.getAttribute('title'),
    'icon': node.getAttribute('icon'),
    'contents': contents
  };
};


questParser.prototype._findNextNode = function(node) {
  while (true) {
    var sibling = node.nextElementSibling;
    if (sibling !== null && sibling.localName !== "event" && sibling.localName !== "comment") {
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

  // Quests must be one of <event/comment/encounter/roleplay/p/e/end>
  if (["DIV", "SPAN", "B", "I", "EVENT", "ENCOUNTER", "ROLEPLAY", "P", "E",
       "END", "COMMENT", "INSTRUCTION"].indexOf(
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