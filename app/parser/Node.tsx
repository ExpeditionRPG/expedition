import * as React from 'react'
import {XMLElement} from '../reducers/StateTypes'
import {QuestContext} from '../reducers/QuestTypes'

const Clone = require('clone');
const Math = require('mathjs') as any;
// TODO(scott): Turn this into a class that wraps XMLElement

export function findNextNode(node: XMLElement, ctx: QuestContext): XMLElement {
  while (true) {
    if (node.length === 0) {
      return null;
    }

    const sibling = node.next();

    // Skip control elements
    if (sibling !== null && sibling.length > 0 && !isControlNode(sibling) && isEnabled(sibling, ctx)) {
      return sibling;
    }

    // Continue searching neighbors if we have neighbors, otherwise
    // search in the parent node.
    if (sibling !== null && sibling.length > 0) {
      node = sibling;
    } else {
      node = node.parent();
    }
  }
}

export function findRootNode(node: XMLElement): XMLElement {
  while (node !== null && node.get(0).tagName.toLowerCase() !== 'quest') {
    node = node.parent();
  }
  return node;
}

export function isControlNode(node: XMLElement): boolean {
  const tagName = node.get(0).tagName.toLowerCase();
  return tagName === 'choice' || tagName === 'event' || (node.attr('on') != null);
}

export function isEnabled(node: XMLElement, ctx: QuestContext): boolean {
  const ifExpr = node.attr('if');
  if (!ifExpr) {
    return true;
  }

  try {
    // Operate on copied scope - checking for enablement should never change the current context.
    // TODO(scott): Make this use Context.tsx (evaluateOp?)
    const visible = Math.eval(ifExpr, Clone(ctx.scope));

    // We check for truthiness here, so nonzero numbers are true, etc.
    return Boolean(visible);
  } catch (e) {
    // If we fail to evaluate (e.g. symbol not defined), treat the node as not visible.
    return false;
  }
}

export function loopChildren(node: XMLElement, cb: (tag: string, c: XMLElement)=>any) {
  for (let i = 0; i < node.children().length; i++) {
    let v = cb(node.children().get(i).tagName.toLowerCase(), node.children().eq(i));
    if (v !== undefined) {
      return v;
    }
  }
}