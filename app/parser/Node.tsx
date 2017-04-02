import * as React from 'react'
import {XMLElement} from '../reducers/StateTypes'
import {QuestContext} from '../reducers/QuestTypes'

const Clone = require('clone');
const Math = require('mathjs') as any;

function isNumeric(n: any): boolean {
  // http://stackoverflow.com/questions/9716468/is-there-any-function-like-isnumeric-in-javascript-to-validate-numbers
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export class ParserNode {
  public elem: XMLElement;
  private ctx: QuestContext;

  constructor(elem: XMLElement, ctx: QuestContext) {
    this.elem = elem;
    this.ctx = ctx;
  }

  getNext(key?: string|number): ParserNode {
    let next: XMLElement = null;
    if (key === undefined) {
      next = this.getNextNode();
    } else if (isNumeric(key)) {
      // Scan the parent node to find the choice with the right number
      let idx = (typeof(key) === 'number') ? key : parseInt(key, 10);
      let choiceIdx = -1;
      next = this.loopChildren((tag, child) => {
        if (tag !== 'choice') {
          return;
        }
        choiceIdx++;
        if (choiceIdx !== idx) {
          return;
        }

        let result = child.children().eq(0);
        if (this.isElemEnabled(result)) {
          return result;
        }
        return this.getNextNode(result);
      }) || this.getNextNode();
    } else {
      next = this.loopChildren((tag, c) => {
        if (c.attr('on') === key) {
          return c.children().eq(0);
        }
      }) || null;
    }
    return (next) ? new ParserNode(next, this.ctx) : null;
  }

  gotoId(id: string): ParserNode {
    const search = this.getRootElem().find('#'+id);
    if (search.length === 0) {
      return null;
    }
    return new ParserNode(search.eq(0), this.ctx);
  }

  // Loop through all enabled children. If a call to cb() returns a value
  // other than undefined, break the loop early and return the value.
  loopChildren(cb: (tag: string, c: XMLElement)=>any): any {
    for (let i = 0; i < this.elem.children().length; i++) {
      let c = this.elem.children().eq(i);
      if (!this.isElemEnabled(c)) {
        continue;
      }
      let tag = this.elem.children().get(i).tagName.toLowerCase();
      let v = cb(tag, c);
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