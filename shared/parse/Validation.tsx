import {TEMPLATE_TYPES} from '../render/render/Template';
// TODO(https://github.com/ExpeditionRPG/expedition-app/issues/291): Actually use this

export function isEmptyObject(obj: object): boolean {
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
function getInvalidNodesAndAttributes(node: Cheerio): { [key: string]: number; } {
  const results: any = {};

  // Quests must only contain these tags:
  if ((['op', 'quest', 'div', 'span', 'b', 'i', 'choice', 'event', 'p', 'e', 'em',
       'trigger', 'instruction'] + (TEMPLATE_TYPES as string[])).indexOf(
        node.get(0).tagName.toLowerCase()) === -1) {
    results[node.get(0).tagName.toLowerCase()] = (results[node.get(0).tagName.toLowerCase()] || 0) + 1;
  }

  const attribNames = Object.keys(node.get(0).attribs);
  for (const attribName of attribNames) {
    // All HTML event handlers are prefixed with 'on'.
    // See http://www.w3schools.com/tags/ref_eventattributes.asp
    // We use just 'on' without any extras, which is not used by HTML for event handling.
    if (attribName.indexOf('on') === 0 && attribName !== 'on') {
      const k = node.get(0).tagName.toLowerCase() + '.' + attribName;
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
function getDuplicateIds(node: Cheerio): { [key: string]: string[]; } {
  const map = generateIdMapping(node);
  const results: { [key: string]: string[]; } = {};
  Object.keys(map).forEach((k: string) => {
    if (map[k].length > 1) {
      results[k] = map[k];
    }
  });
  return results;
}

// Builds and returns a map of all IDs to all nodes with that ID.
function generateIdMapping(node: Cheerio): { [key: string]: string[]; } {
  const map: { [key: string]: string[]; } = {};
  if (node.attr('id')) {
    const id = node.attr('id');
    map[id] = (map[id] || []).concat([node.get(0).tagName.toLowerCase()]);
  }

  for (let i = 0; i < node.children().length; i++) {
    const m = generateIdMapping(node.children().eq(i));
    Object.keys(m).forEach((k: any): void => {
      map[k] = (map[k] || []).concat(this[k]);
    });
  }
  return map;
}
