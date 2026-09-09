import { Cheerio } from '../Cheerio';
import { TEMPLATE_TYPES } from '../schema/templates/Templates';
// TODO(https://github.com/ExpeditionRPG/expedition-app/issues/291): Actually use this

export function isEmptyObject(obj: object): boolean {
  return (
    Object.keys(obj).length === 0 && JSON.stringify(obj) === JSON.stringify({})
  );
}

export function validate(root: Cheerio) {
  if (root === undefined) {
    throw new Error('Quest has invalid root node');
  }

  const badEntries = getInvalidNodesAndAttributes(root);
  if (!isEmptyObject(badEntries)) {
    throw new Error(
      'Found invalid nodes and attributes: ' + JSON.stringify(badEntries),
    );
  }

  const duplicateIDs = getDuplicateIds(root);
  if (!isEmptyObject(duplicateIDs)) {
    throw new Error(
      'Found nodes with duplicate ids: ' + JSON.stringify(duplicateIDs),
    );
  }
}

// Validate this node and all children for invalid tags.
// Returns a map of tagName->count of the invalid elements found.
function getInvalidNodesAndAttributes(node: Cheerio): {
  [key: string]: number;
} {
  const results: any = {};

  // Quests must only contain these tags:
  const validTags = [
    'op',
    'quest',
    'div',
    'span',
    'b',
    'i',
    'choice',
    'event',
    'p',
    'e',
    'em',
    'trigger',
    'instruction',
  ];
  Array.prototype.push.apply(validTags, TEMPLATE_TYPES as string[]);
  // `get(0)` is undefined for an empty set; @types/cheerio declared it as
  // always returning an element, which is why this used to read as if it
  // could not be.
  const el = node.get(0);
  if (!el) {
    return results;
  }
  const tagName = el.tagName.toLowerCase();
  if (validTags.indexOf(tagName) === -1) {
    results[tagName] = (results[tagName] || 0) + 1;
  }

  const attribNames = Object.keys(el.attribs);
  for (const attribName of attribNames) {
    // All HTML event handlers are prefixed with 'on'.
    // See http://www.w3schools.com/tags/ref_eventattributes.asp
    // We use just 'on' without any extras, which is not used by HTML for event handling.
    if (attribName.indexOf('on') === 0 && attribName !== 'on') {
      const k = tagName + '.' + attribName;
      results[k] = (results[k] || 0) + 1;
    }
  }

  for (let i = 0; i < node.children().length; i++) {
    const v = getInvalidNodesAndAttributes(node.children().eq(i));
    Object.keys(v).forEach((k: string): void => {
      results[k] = (results[k] || 0) + v[k];
    });
  }
  return results;
}

// Validate this node and all children for duplicate IDs.
// Returns a map of id->[element] of all duplicate elements with the same IDs.
function getDuplicateIds(node: Cheerio): { [key: string]: string[] } {
  const map = generateIdMapping(node);
  const results: { [key: string]: string[] } = {};
  Object.keys(map).forEach((k: string) => {
    if (map[k].length > 1) {
      results[k] = map[k];
    }
  });
  return results;
}

// Builds and returns a map of all IDs to all nodes with that ID.
function generateIdMapping(node: Cheerio): { [key: string]: string[] } {
  const map: { [key: string]: string[] } = {};
  const id = node.attr('id');
  const el = node.get(0);
  if (id && el) {
    map[id] = (map[id] || []).concat([el.tagName.toLowerCase()]);
  }

  for (let i = 0; i < node.children().length; i++) {
    const m = generateIdMapping(node.children().eq(i));
    Object.keys(m).forEach((k: any): void => {
      map[k] = (map[k] || []).concat(m[k]);
    });
  }
  return map;
}
