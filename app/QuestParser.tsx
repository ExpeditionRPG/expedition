/* Parses quest syntax and traverses it as a player would.
   Returns objects of the type:
   {'type', 'icon', 'title', 'contents'}
   where all arguments except 'type' are optional.
   See quests/quest_spec.txt for specification.
*/
/*global math */
import * as React from 'react'
import {XMLElement} from './reducers/StateTypes'
import {QuestCardName} from './reducers/QuestTypes'
import {ChoiceAction, EventAction} from './actions/ActionTypes'

export interface TriggerResult {
  node: XMLElement;
  name: string;
}

export interface RoleplayResult {
  icon: string;
  title: string;
  content: JSX.Element;
  actions: {text: string, idx: number}[];
}

export interface Enemy {
  name: string,
  tier: number,
}

export interface CombatResult {
  icon: string;
  enemies: Enemy[];
}

export function validate(root: XMLElement) {
  if (root === undefined) {
    throw new Error("Quest has invalid root node");
  }

  var badEntries = _getInvalidNodesAndAttributes(root);
  if (!_isEmptyObject(badEntries)) {
    throw new Error("Found invalid nodes and attributes: " + JSON.stringify(badEntries));
  }

  var duplicateIDs = _getDuplicateIds(root);
  if (!_isEmptyObject(duplicateIDs)) {
    throw new Error("Found nodes with duplicate ids: " + JSON.stringify(duplicateIDs));
  }

  // TODO(scott): Add check for proper resolution of combat enemies
  //this._parser = math.parser(); // jshint ignore:line
};

/*
questParser.prototype.setGameState = function(state) {
  if (!this._parser) {
    return;
  }
  this._parser.eval('_gamestate_ = ' + JSON.stringify(state));
  // TODO: Include helper functions for accessing game state vars
};
*/

export function init(root: XMLElement): XMLElement {
  return _loadNode(root.children[0]);
}

// The passed event parameter is a string indicating which event to fire based on the "on" attribute.
export function handleEvent(parent: XMLElement, event: string): XMLElement {
  var child = _loopChildren(parent, function(tag: string, c: XMLElement) {
    if (c.getAttribute('on') === event && _isEnabled(c)) {
      return c;
    }
  }.bind(this));

  if (!child) {
    throw new Error("Could not find child with on='"+event+"'");
  }
  return _loadNode(child);
};

// The passed choice parameter is an number indicating the choice number in the XML element, including conditional choices.
export function handleChoice(parent: XMLElement, choice: number): XMLElement {

  // Scan the parent node to find the choice with the right number
  var idx = 0;
  var choiceIdx = -1;
  for (; idx < parent.children.length; idx++) {
    if (parent.children[idx].localName === "choice") {
      choiceIdx++;
    }

    // When we find our choice, push it onto the stack and load it.
    if (choiceIdx === choice) {
      return _loadNode(parent.children[idx]);
    }
  }

  // This happens on lookup error or default "Next"/"End" event
  if (_loopChildren(parent, function(tag) { if (tag === "end") { return true; }})) {
    return null;
  }
  return _loadNode(_findNextNode(parent));
};

export function getNodeCardType(node: XMLElement): QuestCardName {
  switch(node.localName) {
    case 'roleplay':
      return 'ROLEPLAY';
    case 'combat':
      return 'COMBAT';
    default:
      throw new Error("Could not get node card type for node " + node.localName);
  }
}

function _loadNode(node: XMLElement): XMLElement {
  switch(node.localName) {
    //case "op":
    // return _loadOpNode(node);
    case "choice":
      return _loadChoiceNode(node);
    case "event":
      return _loadEventNode(node);
    case "combat":
      return node;
    case "roleplay":
      return node;
    case "trigger":
      return node;
    case "comment":
      return _loadNode(_findNextNode(node));
    default:
      throw new Error("Unknown node name: " + node.localName);
  }
};

/*
questParser.prototype._loadOpNode = function(node: XMLElement) {
  this._parser.eval(node.textContent);

  // After evaluation, move on to the next node.
  this.path.push(_findNextNode(node));
  return this._loadCurrentNode();
};
*/

function _loadChoiceNode(node: XMLElement): XMLElement {
  // The action on a choice node is functionally the same as an event node.
  return _loadEventNode(node);
};

function _loadEventNode(node: XMLElement): XMLElement {
  // If event is empty and has a goto, jump to the destination element with that id.
  if (node.children.length === 0 && node.hasAttribute('goto')) {
    return _loadNode(node.querySelector("#"+node.getAttribute('goto')));
  }

  // Validate the event node (must not have an event child and must control something)
  var hasControlChild = false;
  _loopChildren(node, function(tag) {
    if (tag === 'event' || tag === 'choice') {
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
  return _loadNode(node.children[0]);
};

export function loadCombatNode(node: XMLElement): CombatResult {
  var enemies: Enemy[] = [];

  // Track win and lose events for validation
  var winEventCount = 0;
  var loseEventCount = 0;
  _loopChildren(node, function(tag: string, c: XMLElement) {
    switch (tag) {
      case 'e':
        // TODO: Dynamically assign tier here
        enemies.push({name: c.textContent, tier: 1});
        break;
      case 'event':
      case 'roleplay':
        winEventCount += (c.getAttribute('on') === 'win' && _isEnabled(c)) ? 1 : 0;
        loseEventCount += (c.getAttribute('on') === 'lose' && _isEnabled(c)) ? 1 : 0;
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

  if (!enemies.length) {
    throw new Error("<combat> has no <e> children");
  }

  // TODO: Add modifiable combat scope.

  return {
    icon: node.getAttribute('icon'),
    enemies,
  };
};

export function loadTriggerNode(node: XMLElement): TriggerResult {
  return {
    node,
    name: node.textContent
  };
};

function _isEnabled(node: XMLElement): boolean {
  // Comments are never visible.
  if (node.localName === "comment") {
    return false;
  }

  // We check for truthiness here, so nonzero numbers are true, etc.
  return !node.hasAttribute('if'); // || this._parser.eval("boolean(" + node.getAttribute('if') + ")");
};

function _xmlToJSX(node: XMLElement): JSX.Element {
  return ((node as any) as JSX.Element)
}

export function loadRoleplayNode(node: XMLElement): RoleplayResult {
  // Append elements to contents
  var numEvents = 0;
  var child: XMLElement;
  var actions: {text: string, idx: number}[] = [];
  var children: XMLElement = ((document.createElement('span') as any) as XMLElement);

  // Keep track of the number of choice nodes seen, so we can
  // select a choice without worrying about the state of the quest scope.
  var idx = -1;

  _loopChildren(node, function(tag: string, c: XMLElement) {
    c = c.cloneNode(true);

    if (tag === "choice") {
      idx++;
    }

    // Skip elements that aren't visible
    if (!_isEnabled(c)) {
      return;
    }

    // TODO(scott): Deep-parse all operations inside the dialog and convert them into
    // their values.

    // Accumulate "choice" tags in actions[]
    if (tag === "choice") {
      if (!c.hasAttribute('text')) {
        throw new Error("<choice> inside <roleplay> must have 'text' attribute");
      }
      var text = c.getAttribute('text');
      actions.push({text, idx});
      numEvents++;
      return;
    }

    if (tag === "event") {
      throw new Error("<roleplay> cannot contain <event>.");
    }

    // Convert "instruction" tags to <expedition-indicator> tags.
    if (tag === "instruction") {
      var inner = ((document.createElement('span') as any) as XMLElement);
      inner.innerHTML = c.innerHTML;
      c = ((document.createElement('expedition-indicator') as any) as XMLElement);
      c.setAttribute('icon', 'adventurer');
      c.appendChild(inner);
    }

    children.appendChild(c);
  }.bind(this));

  // Append a generic "Next" button if there were no events,
  // or an "End" button if there's also an <End> tag.
  if (numEvents === 0) {
    // Handle custom generic next button text based on if we're heading into a trigger node.
    var nextNode = _findNextNode(node);
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
    actions.push({text: buttonText, idx: 0});
  }

  return {
    title: node.getAttribute('title'),
    icon: node.getAttribute('icon'),
    content: <span dangerouslySetInnerHTML={{__html: children.innerHTML}} />,
    actions,
  };
};

function _isControlNode(node: XMLElement) {
  return node.localName === "choice" || node.localName === "event" || node.hasAttribute('on');
};

function _findNextNode(node: XMLElement) {
  while (true) {
    var sibling = node.nextElementSibling;

    // Skip control elements and conditionally false elements
    if (sibling !== null && !_isControlNode(sibling) && _isEnabled(sibling)) {
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

function _loopChildren(node: XMLElement, cb: (tag: string, c: XMLElement)=>any) {
  for (var i = 0; i < node.children.length; i++) {
    var v = cb(node.children[i].localName, node.children[i]);
    if (v !== undefined) {
      return v;
    }
  }
};

// Validate this node and all children for invalid tags.
// Returns a map of tagName->count of the invalid elements found.
function _getInvalidNodesAndAttributes(node: XMLElement) {
  var results: any = {};

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

  var mergeResults = function(k: string): void {
    results[k] = (results[k] || 0) + this[k];
  };
  for (i = 0; i < node.children.length; i++) {
    var v = _getInvalidNodesAndAttributes(node.children[i]);
    Object.keys(v).forEach(mergeResults.bind(v));
  }
  return results;
};

// Validate this node and all children for duplicate IDs.
// Returns a map of id->[element] of all duplicate elements with the same IDs.
function _getDuplicateIds(node: XMLElement): { [key:string]:string[]; } {
  var map = _generateIdMapping(node);

  var results: { [key:string]:string[]; } = {};
  Object.keys(map).forEach(function(k: string) {
    if (map[k].length > 1) {
      results[k] = map[k];
    }
  });

  return results;
};

// Builds and returns a map of all IDs to all nodes with that ID.
function _generateIdMapping(node: XMLElement): { [key:string]:string[]; } {
  var map: { [key:string]:string[]; } = {};
  if (node.hasAttribute("id")) {
    var id = node.getAttribute("id");
    map[id] = (map[id] || []).concat([node.localName]);
  }

  var mergeResults = function(k: any) {
    map[k] = (map[k] || []).concat(this[k]);
  };
  for (var i = 0; i < node.children.length; i++) {
    var m = _generateIdMapping(node.children[i]);
    Object.keys(m).forEach(mergeResults.bind(m));
  }
  return map;
};

function _isEmptyObject(obj: Object) {
  return Object.keys(obj).length === 0 && JSON.stringify(obj) === JSON.stringify({});
};
