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

questParser.prototype.choiceEvent = function(choice) {
  var that = this;
  var parent = this.path[this.path.length - 1];
  if (typeof choice === "number") {
    if (!parent.children[choice] || parent.children[choice].localName !== "choice") {
      // Happens on lookup error or default "Next"/"End" choice
      if (parent.localName === 'end') {
        return {'type': 'end', 'contents': parent.hasAttribute('win')};
      }
      this.path.push(this._findNextNode(parent));
    } else {
      this.path.push(parent.children[choice]);
    }
  } else if (choice === 'win' || choice === 'lose') {
    var foundChoice = this._loopChildren(parent, function(tag, c) {
      if (tag !== 'choice' || !c.hasAttribute(choice)) {
        return;
      }
      that.path.push(c);
      return true;
    });

    if (!foundChoice) {
      throw new Error("Could not find choice with attribute: " + choice);
    }
  } else {
    throw new Error("Invalid choiceEvent " + choice);
  }
  return this._loadCurrentNode();
};

questParser.prototype.back = function() {
  if (this.path.length <= 1) {
    return null;
  }

  // Pop the most recent node, as well as all preceding choice nodes
  // until we come to something we can actually display.
  do {
    this.path.pop();
  } while (this.path[this.path.length-1].localName === "choice");

  return this._loadCurrentNode();
};

questParser.prototype._loadCurrentNode = function() {
  var node = this.path[this.path.length - 1];
  switch(node.localName) {
    case "choice":
      return this._loadChoiceNode(node);
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

questParser.prototype._loadChoiceNode = function(node) {
  // If choice is empty and has id attribute, jump to the destination element.
  if (node.children.length === 0 && node.hasAttribute('goto')) {
    this.path.push(this.root.querySelector("#"+node.getAttribute('goto')));
    return this._loadCurrentNode();
  }

  // Validate the choice node (must only have <roleplay> or <encounter> or <end>)
  var hasControlChild = false;
  this._loopChildren(node, function(tag) {
    if (tag === 'choice') {
      throw new Error("<choice> node cannot have <choice> child");
    }

    if (tag === 'encounter' || tag === 'end' || tag === 'roleplay') {
      hasControlChild = true;
    }
  });
  if (!hasControlChild) {
    throw new Error("<choice> without goto attribute must have at least one of <encounter/end/roleplay>");
  }

  // If we're on a "choice" node, dive in to the first choice.
  this.path.push(node.children[0]);
  return this._loadCurrentNode();
};

questParser.prototype._loadEncounterNode = function(node) {
  var encounter = [];

  // Track win and lose choices for proper formatting
  var winChoiceCount = 0;
  var loseChoiceCount = 0;
  this._loopChildren(node, function(tag, c) {
    switch (tag) {
      case 'e':
        encounter.push({name: c.textContent});
        break;
      case 'choice':
        if (c.hasAttribute('win')) {
          winChoiceCount++;
        } else if (c.hasAttribute('lose')) {
          loseChoiceCount++;
        } else {
          throw new Error("Encounter choice without win/lose attribute");
        }
        break;
      default:
        throw new Error("Invalid child element: " + tag);
    }
  });

  if (winChoiceCount !== 1) {
    throw new Error("<encounter> missing <choice win> child");
  }

  if (loseChoiceCount !== 1) {
    throw new Error("<encounter> missing <choice lose> child");
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
  this._loopChildren(node, function(tag) {
    if (tag === 'encounter' || tag === 'choice' || tag === 'end' || tag === 'roleplay') {
        throw new Error("<end> cannot contain tag: " + tag);
    }
  });

  if (!node.hasAttribute('win') && !node.hasAttribute('lose')) {
    throw new Error("<end> must have win or lose attribute (i.e. <end win>, <end lose>)");
  }
  return this._loadDialogNode(node);
};

questParser.prototype._loadDialogNode = function(node) {
  // Append elements to contents
  var numChoices = 0;
  var child;
  var contents = document.createElement('span');
  this._loopChildren(node, function(tag, c) {
    c = c.cloneNode(true);

    // Convert "choice" tags to <a></a>
    if (tag === "choice") {
      if (!c.childNodes.length) {
        throw new Error("<choice> must contain choice text");
      }
      if (c.childNodes[0].data === "End") {
        throw new Error("<choice> text cannot be \"End\"");
      }

      var text = c.childNodes[0];
      c = document.createElement('expedition-button');
      Polymer.dom(c).appendChild(text);
      numChoices++;
    }
    contents.appendChild(c);
  });

  // Append a generic "Next" button if there were no choices.
  if (numChoices === 0) {
    child = document.createElement('expedition-button');
    Polymer.dom(child).innerHTML = (node.localName === "end") ? "End" : "Next";
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
    if (sibling !== null && sibling.localName !== "choice" && sibling.localName !== "comment") {
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

  // Quests must be one of <choice/comment/encounter/roleplay/p/e/end>
  if (["DIV", "SPAN", "B", "I", "CHOICE", "ENCOUNTER", "ROLEPLAY", "P", "E",
       "END", "COMMENT", "INSTRUCTION"].indexOf(
        node.tagName) === -1) {
    results[node.tagName] = (results[node.tagName] || 0) + 1;
  }

  for (var i = 0; i < node.attributes.length; i++) {
    // All HTML event handlers are prefixed with 'on'
    if (node.attributes[i].name.indexOf('on') === 0) {
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