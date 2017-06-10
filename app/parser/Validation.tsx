import * as React from 'react'

// TODO(https://github.com/ExpeditionRPG/expedition-app/issues/291): Actually use this

export function isEmptyObject(obj: Object): boolean {
  return Object.keys(obj).length === 0 && JSON.stringify(obj) === JSON.stringify({});
}

export function validate(root: Cheerio) {
  if (root === undefined) {
    throw new Error('Quest has invalid root node');
  }

  const badEntries = getInvalidNodesAndAttributes(root);
  if (!isEmptyObject(badEntries)) {
    throw new Error('Found invalid nodes and attributes: ' + JSON.stringify(badEntries));
  }

  const duplicateIDs = getDuplicateIds(root);
  if (!isEmptyObject(duplicateIDs)) {
    throw new Error('Found nodes with duplicate ids: ' + JSON.stringify(duplicateIDs));
  }
}

// Validate this node and all children for invalid tags.
// Returns a map of tagName->count of the invalid elements found.
function getInvalidNodesAndAttributes(node: Cheerio): { [key:string]:number; } {
  const results: any = {};

  // Quests must only contain these tags:
  if (['op', 'quest', 'div', 'span', 'b', 'i', 'choice', 'event', 'combat', 'roleplay', 'p', 'e', 'em',
       'trigger', 'instruction'].indexOf(
        node.get(0).tagName.toLowerCase()) === -1) {
    results[node.get(0).tagName.toLowerCase()] = (results[node.get(0).tagName.toLowerCase()] || 0) + 1;
  }

  const attribNames = Object.keys(node.get(0).attribs);
  for (let i = 0; i < attribNames.length; i++) {
    // All HTML event handlers are prefixed with 'on'.
    // See http://www.w3schools.com/tags/ref_eventattributes.asp
    // We use just 'on' without any extras, which is not used by HTML for event handling.
    if (attribNames[i].indexOf('on') === 0 && attribNames[i] !== 'on') {
      const k = node.get(0).tagName.toLowerCase() + '.' + attribNames[i];
      results[k] = (results[k] || 0) + 1;
    }
  }

  for (let i = 0; i < node.children().length; i++) {
    const v = getInvalidNodesAndAttributes(node.children().eq(i));
    Object.keys(v).forEach((k: string): void => {
      results[k] = (results[k] || 0) + this[k];
    });
  }
  return results;
}

// Validate this node and all children for duplicate IDs.
// Returns a map of id->[element] of all duplicate elements with the same IDs.
function getDuplicateIds(node: Cheerio): { [key:string]:string[]; } {
  const map = generateIdMapping(node);
  const results: { [key:string]:string[]; } = {};
  Object.keys(map).forEach((k: string) => {
    if (map[k].length > 1) {
      results[k] = map[k];
    }
  });
  return results;
}

// Builds and returns a map of all IDs to all nodes with that ID.
function generateIdMapping(node: Cheerio): { [key:string]:string[]; } {
  const map: { [key:string]:string[]; } = {};
  if (node.attr('id')) {
    const id = node.attr('id');
    map[id] = (map[id] || []).concat([node.get(0).tagName.toLowerCase()]);
  }

  for (let i = 0; i < node.children().length; i++) {
    let m = generateIdMapping(node.children().eq(i));
    Object.keys(m).forEach((k: any): void => {
      map[k] = (map[k] || []).concat(this[k]);
    });
  }
  return map;
}

function validateCombatNodes(root: Cheerio) {
  /* TODO
  if (winEventCount === 0) {
    throw new Error('<combat> must have at least one conditionally true child with on="win"');
  }

  if (loseEventCount === 0) {
    throw new Error('<combat> must have at least one conditionally true child with on="lose"');
  }

  if (!enemies.length) {
    throw new Error('<combat> has no <e> children');
  }
  */
}
