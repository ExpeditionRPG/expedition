import * as React from 'react'
import {XMLElement} from '../reducers/StateTypes'
import {QuestContext} from '../reducers/QuestTypes'

const Clone = require('clone');
const Math = require('mathjs') as any;

export class ParserNode {
  public elem: XMLElement;
  private ctx: QuestContext;

  constructor(elem: XMLElement, ctx: QuestContext) {
    this.elem = elem;
    this.ctx = ctx;
  }

  getNext(): ParserNode {
    let elem = this.elem;
    while (true) {
      if (elem.length === 0) {
        return null;
      }

      const sibling = elem.next();

      // Skip control elements
      if (sibling !== null && sibling.length > 0 
          && !this.isElemControl(sibling) 
          && this.isElemEnabled(sibling)) {
        return new ParserNode(sibling, this.ctx);
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

  gotoId(id: string): ParserNode {
    const dest = this.getRootElem().find('#'+id).eq(0);
    if (!dest) {
      return null;
    }
    return new ParserNode(dest, this.ctx);
  }

  // Loop through all enabled children. If a call to cb() returns a value
  // other than undefined, break the loop early and return the value.
  loopChildren(cb: (tag: string, c: XMLElement, i: number)=>any): any {
    for (let i = 0; i < this.elem.children().length; i++) {
      let c = this.elem.children().eq(i);
      if (!this.isElemEnabled(c)) {
        continue;
      }
      let tag = this.elem.children().get(i).tagName.toLowerCase();
      let v = cb(tag, c, i);
      if (v !== undefined) {
        return v;
      }
    }
  }

  private getRootElem(): XMLElement {
    let elem = this.elem;
    while (elem !== null && elem.get(0).tagName.toLowerCase() !== 'quest') {
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