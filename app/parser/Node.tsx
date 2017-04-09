import * as React from 'react'
import {XMLElement} from '../reducers/StateTypes'
import {QuestContext} from '../reducers/QuestTypes'
import {updateContext, evaluateContentOps} from './Context'

const Clone = require('clone');
const Math = require('mathjs') as any;

function isNumeric(n: any): boolean {
  // http://stackoverflow.com/questions/9716468/is-there-any-function-like-isnumeric-in-javascript-to-validate-numbers
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function getNodeAttributes(e: XMLElement): {[key:string]:string;} {
  // cheerio uses "attribs" instead
  let attribs: {[key:string]:string;} = (e.get(0) as any).attribs;
  if (attribs) {
    return attribs;
  }

  // Regular XMLElements have NamedNodeMap
  attribs = {};
  for (const p of e.get(0).attributes) {
    if (typeof p.nodeValue !== 'undefined') attribs[p.nodeName] = p.nodeValue;
  }
}

export class ParserNode {
  public elem: XMLElement;
  public ctx: QuestContext;
  private renderedChildren: {rendered: XMLElement, original: XMLElement}[];

  constructor(elem: XMLElement, ctx: QuestContext) {
    this.elem = elem;
    this.ctx = updateContext(elem, ctx);
    this.renderChildren();
  }

  clone(): ParserNode {
    // Context is deep-copied via updateContext.
    return new ParserNode(this.elem, this.ctx);
  }

  getTag(): string {
    return this.elem.get(0).tagName.toLowerCase();
  }

  getNext(key?: string|number): ParserNode {
    let next: XMLElement = null;
    if (key === undefined) {
      next = this.getNextNode();
    } else if (isNumeric(key)) {
      // Scan the parent node to find the choice with the right number
      let idx = (typeof(key) === 'number') ? key : parseInt(key, 10);
      let choiceIdx = -1;
      next = this.loopChildren((tag, child, orig) => {
        if (tag !== 'choice') {
          return;
        }
        choiceIdx++;
        if (choiceIdx !== idx) {
          return;
        }

        // Use original node here, so we don't break dom structure
        // due to child cloning/rendering.
        let result = orig.children().eq(0);
        if (this.isElemEnabled(result)) {
          return result;
        }
        return this.getNextNode(result);
      }) || this.getNextNode();
    } else {
      next = this.loopChildren((tag, child, orig) => {
        if (child.attr('on') === key) {
          // Use original node here, so we don't break dom structure
          // due to child cloning/rendering.
          return orig.children().eq(0);
        }
      }) || null;
    }
    return (next) ? new ParserNode(next, this.ctx) : null;
  }

  // Evaluates all content ops in-place and creates a list of
  // rendered (and therefore "enabled") child elements.
  // Context is affected.
  private renderChildren() {
    this.renderedChildren = [];
    for (let i = 0; i < this.elem.children().length; i++) {
      // TODO(scott): Parsing of text nodes using .contents().
      // We should should handle programmatic gotos, for instance.

      let child = this.elem.children().eq(i);
      if (!this.isElemEnabled(child)) {
        continue;
      }

      let c = child.clone();

      // Evaluate ops in attributes
      const attribs = getNodeAttributes(c);
      for (let j in attribs) {
        c.attr(j, evaluateContentOps(attribs[j], this.ctx));
      }

      // Evaluate all non-control node bodies
      if (!this.isElemControl(c)) {
        let evaluated = evaluateContentOps(c.html(), this.ctx);
        if (evaluated === '') {
          continue;
        }
        c.html(evaluated);
      }

      this.renderedChildren.push({rendered: c, original: child});
    }
  }

  gotoId(id: string): ParserNode {
    const search = this.getRootElem().find('#'+id);
    if (search.length === 0) {
      return null;
    }
    return new ParserNode(search.eq(0), this.ctx);
  }

  // Loop through all rendered children. If a call to cb() returns a value
  // other than undefined, break the loop early and return the value.
  loopChildren(cb: (tag: string, child: XMLElement, original: XMLElement)=>any): any {
    for (let i = 0; i < this.renderedChildren.length; i++) {
      let c = this.renderedChildren[i];
      let tag = this.renderedChildren[i].rendered.get(0).tagName.toLowerCase();
      let v = cb(tag, c.rendered, c.original);
      if (v !== undefined) {
        return v;
      }
    }
  }

  private getNextNode(elem?: XMLElement): XMLElement {
    if (!elem) {
      elem = this.elem;
    }
    while (true) {
      if (elem.length === 0) {
        return null;
      }

      const sibling = elem.next();

      if (sibling !== null && sibling.length > 0
          && !this.isElemControl(sibling)
          && this.isElemEnabled(sibling)) {
        return sibling;
      }

      // Continue searching neighbors if we have neighbors, otherwise
      // search in the parent elem.
      if (sibling !== null && sibling.length > 0) {
        elem = sibling;
      } else {
        elem = elem.parent();
      }
    }
  }

  private getRootElem(): XMLElement {
    let elem = this.elem;
    while (elem && elem.get(0) && elem.get(0).tagName.toLowerCase() !== 'quest') {
      elem = elem.parent();
    }
    return elem;
  }

  private isElemControl(elem: XMLElement): boolean {
    const tagName = elem.get(0).tagName.toLowerCase();
    return tagName === 'choice' || tagName === 'event' || (elem.attr('on') != null);
  }

  private isElemEnabled(elem: XMLElement): boolean {
    if (!elem) {
      return false;
    }
    const ifExpr = elem.attr('if');
    if (!ifExpr) {
      return true;
    }

    try {
      // Operate on copied scope - checking for enablement should never change the current context.
      // TODO(scott): Make this use Context.tsx (evaluateOp?)
      const visible = Math.eval(ifExpr, Clone(this.ctx.scope));

      // We check for truthiness here, so nonzero numbers are true, etc.
      return Boolean(visible);
    } catch (e) {
      // If we fail to evaluate (e.g. symbol not defined), treat the elem as not visible.
      return false;
    }
  }
}