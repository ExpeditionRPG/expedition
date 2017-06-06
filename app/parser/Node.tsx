import * as React from 'react'
import {CheerioElement, DOMElement} from '../reducers/StateTypes'
import {QuestContext} from '../reducers/QuestTypes'
import {updateContext, evaluateContentOps} from './Context'

const Clone = require('clone');
const Math = require('mathjs') as any;

function isNumeric(n: any): boolean {
  // http://stackoverflow.com/questions/9716468/is-there-any-function-like-isnumeric-in-javascript-to-validate-numbers
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function getNodeAttributes(e: CheerioElement): {[key:string]:string;} {
  return e.attribs || (e.get(0) as any as CheerioElement).attribs;
}

// Creates and returns a unique string that represents this exact node state.
// A call to deserializeNode() with the output of this function and the quest root should return
// a fully-functional ParserNode.
/*
export function serializeNode(node: ParserNode): string {
  const ctxStr = serializeContext(node.ctx);

  return JSON.stringify({
    'line': node.elem.attr('data-line') || -1,
    'ctx': ctxStr,
  });
}

export function deserializeNode(nodeKey: string, questRoot: CheerioElement) {
  var obj = JSON.parse(nodeKey);

  return new ParserNode(questRoot.find('[data-line="' + obj.line + '"]').eq(0), deserializeContext(obj.ctx));
}
*/

function getChildNumber(domElement: DOMElement): number {
    var i=1;;
    while(domElement.previousSibling){
      domElement = domElement.previousSibling;
      i++;
    }
    return i;
}

function getSelector(elem: CheerioElement): string {
  var domElement = elem.get(0);
  var selector = '';
  do {
      selector = '>' + domElement.tagName + ':nth-child(' + getChildNumber(domElement) + ')' + selector;
      domElement = domElement.parentNode;
  } while (domElement !== null && !domElement.id && domElement.tagName.toLowerCase() !== 'quest')

  if (domElement === null) {
    return selector;
  } else if (domElement.tagName.toLowerCase() === 'quest') {
    return 'quest ' + selector;
  } else {
    return '#' + domElement.id + selector;
  }
}

export class ParserNode {
  public elem: CheerioElement;
  public ctx: QuestContext;
  private renderedChildren: {rendered: CheerioElement, original: CheerioElement}[];

  constructor(elem: CheerioElement, ctx: QuestContext, action?: string|number) {
    this.elem = elem;
    this.ctx = updateContext(elem, ctx, action);
    this.renderChildren();
  }

  clone(): ParserNode {
    // Context is deep-copied via updateContext.
    return new ParserNode(this.elem, this.ctx);
  }

  getTag(): string {
    const e = this.elem.get(0);
    return (e) ? e.tagName.toLowerCase() : null;
  }

  getVisibleKeys(): (string|number)[] {
    let choiceIdx = -1;
    let keys: (string|number)[] = [];
    this.loopChildren((tag, child, orig) => {
      if (child.attr('on') !== undefined) {
        keys.push(child.attr('on'));
      } else if (tag === 'choice') {
        choiceIdx++;
        keys.push(choiceIdx);
      }
    });
    return keys;
  }

  getNext(key?: string|number): ParserNode {
    let next: CheerioElement = null;
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
    return (next) ? new ParserNode(next, this.ctx, key) : null;
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
    return new ParserNode(search.eq(0), this.ctx, '#'+id);
  }

  // Loop through all rendered children. If a call to cb() returns a value
  // other than undefined, break the loop early and return the value.
  loopChildren(cb: (tag: string, child: CheerioElement, original: CheerioElement)=>any): any {
    for (let i = 0; i < this.renderedChildren.length; i++) {
      let c = this.renderedChildren[i];
      let tag = this.renderedChildren[i].rendered.get(0).tagName.toLowerCase();
      let v = cb(tag, c.rendered, c.original);
      if (v !== undefined) {
        return v;
      }
    }
  }

  // Get a key such that a different ParserNode object with the same relative XML element
  // and context (i.e. excluding path-specific data) will have the same key.
  //
  // CAVEAT: This uses the toString() method of function objects, which is implementation-dependent
  // but in most cases returns the body of the function. It also ignores function bindings and external
  // references, which prevent it from being a true "serialization" and instead more of a "comparison key"
  // for visit-tracking in quest traversal.
  getComparisonKey(): string {
    let ctx = Clone(this.ctx);

    // Strip un-useful context
    ctx.path = undefined;
    ctx.scope._ = undefined;
    ctx.extern = undefined;

    var ctx_json = JSON.stringify(ctx, (key, val) => {
      return (typeof val === 'function') ? val.toString() : val;
    });

    return JSON.stringify({
      ctx: ctx_json,
      line: parseInt(this.elem.attr('data-line'), 10),
    });
  }

  private getNextNode(elem?: CheerioElement): CheerioElement {
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

  getRootElem(): CheerioElement {
    let elem = this.elem;
    while (elem && elem.get(0) && elem.get(0).tagName.toLowerCase() !== 'quest') {
      elem = elem.parent();
    }
    return elem;
  }

  private isElemControl(elem: CheerioElement): boolean {
    const tagName = elem.get(0).tagName.toLowerCase();
    return tagName === 'choice' || tagName === 'event' || Boolean(elem.attr('on'));
  }

  private isElemEnabled(elem: CheerioElement): boolean {
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
