import {Context, evaluateContentOps, evaluateOp, updateContext} from './Context';

const seedrandom = require('seedrandom');
const Clone = require('clone');
const Math = require('mathjs');

const MAX_GOTO_FOLLOW_DEPTH = 50;

export interface EventParameters {
  xp?: boolean;
  loot?: boolean;
  heal?: number;
}

function isNumeric(n: any): boolean {
  // http://stackoverflow.com/questions/9716468/is-there-any-function-like-isnumeric-in-javascript-to-validate-numbers
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function getNodeAttributes(e: Cheerio): {[key: string]: string; } {
  return e.get(0).attribs;
}

function getTriggerId(elem: Cheerio): string|null {
  const m = elem.text().trim().match(/\s*goto\s+(.*)/);
  return (m) ? m[1] : null;
}

export class Node<C extends Context> {
  public elem: Cheerio;
  public ctx: C;
  private renderedChildren: Array<{rendered: Cheerio, original: Cheerio}>;
  private rng: () => number;

  // Certain fail-safe events are fine under normal behavior, but we may want to
  // strictly check them when crawling for errors.
  private errors: Error[];

  constructor(elem: Cheerio, ctx: C, action?: string|number, seed?: string) {
    this.elem = elem;
    this.errors = [];
    this.ctx = this.updateContext(elem, ctx, action);
    // Overwrite seed after updateContext, which generates one otherwise.
    if (seed) {
      this.ctx.seed = seed;
    }
    this.rng = seedrandom.alea(this.ctx.seed);
    this.renderChildren();
  }

  // updateContext is broken out here so it can be overridden if context is mutated.
  // This is useful e.g. when un-cloneable objects are in the context and need
  // to be removed before the call to Clone in updateContext().
  protected updateContext(elem: Cheerio, ctx: C, action?: string | number): C {
    return updateContext<C>(elem, ctx, action);
  }

  public clone(): this {
    // Context is deep-copied via updateContext.
    // Random seed is persisted on the copied node.
    return new (this.constructor as any)(this.elem, this.ctx, null, this.ctx.seed);
  }

  public getErrors(): Error[] {
    return this.errors;
  }

  public getTag(): string|null {
    const e = this.elem.get(0);
    return (e) ? e.tagName.toLowerCase() : null;
  }

  public getVisibleKeys(): Array<string|number> {
    let choiceIdx = -1;
    const keys: Array<string|number> = [];
    this.loopChildren((tag, child, orig) => {
      const on = child.attr('on');
      if (on !== undefined) {
        keys.push(on);
      } else if (tag === 'choice') {
        choiceIdx++;
        keys.push(choiceIdx);
      }
    });
    return keys;
  }

  // nextSeed is passed as the initial render seed for the resulting
  // Node returned by this function.
  public getNext(key?: string|number, nextSeed?: string): this|null {
    let next: Cheerio | null;
    if (key === undefined) {
      next = this.getNextNode();
    } else if (isNumeric(key)) {
      // Scan the parent node to find the choice with the right number
      const idx = (typeof(key) === 'number') ? key : parseInt(key, 10);
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
        const result = orig.children().eq(0);
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
    return (next) ? new (this.constructor as any)(next, this.ctx, key, nextSeed) : null;
  }

  // Evaluates all content ops in-place and creates a list of
  // rendered (and therefore "enabled") child elements.
  // Context is affected.
  private renderChildren() {
    // Apply the random seed before rendering so we have deterministic
    // output when rendering the node's children.
    Math.config({randomSeed: this.ctx.seed});
    this.renderedChildren = [];
    for (let i = 0; i < this.elem.children().length; i++) {
      // TODO(scott): Parsing of text nodes using .contents().
      // We should should handle programmatic gotos, for instance.

      const child = this.elem.children().eq(i);
      if (!this.isElemEnabled(child)) {
        continue;
      }

      const c = child.clone();

      // Evaluate ops in attributes
      const attribs = getNodeAttributes(c);
      for (const attrib of Object.keys(attribs)) {
        try {
          c.attr(attrib, evaluateContentOps(attribs[attrib], this.ctx));
        } catch (e) {
          this.errors.push(new Error(`Failed to evaluate op in attribute ${attrib}: ${e.toString()}`));
        }
      }

      // Evaluate all non-control node bodies
      if (!this.isElemControl(c)) {
        let evaluated = '';
        try {
          evaluated = evaluateContentOps(c.html() || '', this.ctx);
        } catch (e) {
          this.errors.push(new Error(`Failed to evaluate op section: ${e.toString()}`));
        }
        if (evaluated === '') {
          continue;
        }
        c.html(evaluated);
      }

      this.renderedChildren.push({rendered: c, original: child});
    }
  }

  public gotoId(id: string, seed?: string): this|null {
    const root = this.getRootElem();
    if (root === null) {
      return null;
    }
    const search = root.find('#' + id);
    if (search.length === 0) {
      return null;
    }
    return new (this.constructor as any)(search.eq(0), this.ctx, undefined, seed);
  }

  // Loop through all rendered children. If a call to cb() returns a value
  // other than undefined, break the loop early and return the value.
  public loopChildren(cb: (tag: string, child: Cheerio, original: Cheerio) => any): any {
    for (const child of this.renderedChildren) {
      const tag = child.rendered.get(0).tagName.toLowerCase();
      const v = cb(tag, child.rendered, child.original);
      if (v !== undefined) {
        return v;
      }
    }
  }

  // Useful for adding other meta-information to the path for comparison and/or reconstruction.
  public addToPath(val: string|number): void {
    this.ctx.path.push(val);
  }

  // Get a key such that a different Node object with the same relative XML element
  // and context (i.e. excluding path-specific data) will have the same key.
  //
  // CAVEAT: This uses the toString() method of function objects, which is implementation-dependent
  // but in most cases returns the body of the function. It also ignores function bindings and external
  // references, which prevent it from being a true "serialization" and instead more of a "comparison key"
  // for visit-tracking in quest traversal.
  public getComparisonKey(): string {
    const ctx: any = Clone(this.ctx);

    // Strip un-useful context
    ctx.path = undefined;
    ctx.scope._ = undefined;
    ctx.seed = undefined;

    const ctxJSON = JSON.stringify(ctx, (key, val) => {
      return (typeof val === 'function') ? val.toString() : val;
    });

    return JSON.stringify({
      ctx: ctxJSON,
      line: parseInt(this.elem.attr('data-line') || '-1', 10),
    });
  }

  private getNextNode(elem?: Cheerio): Cheerio|null {
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

  public getRootElem(): Cheerio {
    let elem = this.elem;
    while (elem && elem.get(0) && elem.get(0).tagName.toLowerCase() !== 'quest') {
      elem = elem.parent();
    }
    return elem;
  }

  private isElemControl(elem: Cheerio): boolean {
    const tagName = elem.get(0).tagName.toLowerCase();
    return tagName === 'choice' || tagName === 'event' || Boolean(elem.attr('on'));
  }

  private isElemEnabled(elem: Cheerio): boolean {
    if (!elem) {
      return false;
    }
    const ifExpr = elem.attr('if');
    if (!ifExpr) {
      return true;
    }

    try {
      // Operate on copied scope - checking for enablement should never change the current context.
      const visible = evaluateOp(ifExpr, Clone(this.ctx), this.rng);
      // We check for truthiness here, so nonzero numbers are true, etc.
      return Boolean(visible);
    } catch (e) {
      // If we fail to evaluate (e.g. symbol not defined), display the element
      // so that the quest is still playable - better too many options
      // than not being able to finish.
      this.errors.push(new Error('Failed to evaluate conditional on element: ' + e.toString()));
      return true;
    }
  }

  // The passed event parameter is a string indicating which event to fire based on the "on" attribute.
  // Returns the (cleaned) parameters of the event element
  public getEventParameters(event: string, seed?: string): EventParameters|null {
    const evt = this.getNext(event, seed);
    if (!evt) {
      return null;
    }
    const p = evt.elem.parent();
    const ret: EventParameters = {};
    if (p.attr('xp')) { ret.xp = (p.attr('xp') === 'true'); }
    if (p.attr('loot')) { ret.loot = (p.attr('loot') === 'true'); }
    if (p.attr('heal')) { ret.heal = parseInt(p.attr('heal') || '0', 10); }
    return ret;
  }

  private handleTriggerEvent(seed?: string): this {
    // Search upwards in the node heirarchy and see if any of the parents successfully
    // handle the event.
    let ref = new (this.constructor as any)(this.elem.parent(), this.ctx);
    const event = this.elem.text().trim();
    while (ref.elem && ref.elem.length > 0) {
      const handled = ref.handleAction(event, seed);
      if (handled !== null) {
        return handled;
      }
      ref = new (this.constructor as any)(ref.elem.parent(), this.ctx, undefined, seed);
    }

    // Return the trigger unchanged if a handler is not found.
    return this;
  }

  private handleTrigger(seed?: string): this|null {
    // Immediately act on any gotos (with a max depth)
    let i = 0;
    let ref: this|null = this.clone();
    for (; i < MAX_GOTO_FOLLOW_DEPTH && ref !== null && ref.getTag() === 'trigger'; i++) {
      const id = getTriggerId(ref.elem);
      if (id !== null) {
        ref = ref.gotoId(evaluateContentOps(id, ref.ctx), seed);
      } else {
        return ref.handleTriggerEvent(seed);
      }
    }
    if (i >= MAX_GOTO_FOLLOW_DEPTH) {
      return null;
    }
    return ref;
  }

  // The passed action parameter is either
  // - a number indicating the choice number in the XML element, including conditional choices.
  // - a string indicating which event to fire based on the "on" attribute.
  // Returns the card inside of / referenced by the choice/event element
  public handleAction(action?: number|string, seed?: string): this|null {
    const next = this.getNext(action, seed);
    if (!next) {
      return null;
    }

    if (next.getTag() === 'trigger') {
      return next.handleTrigger(seed);
    }
    return next;
  }

  // Returns if the supplied node is an **end** trigger
  public isEnd(): boolean {
    return (this.getTag() === 'trigger' && this.elem.text().toLowerCase().split(' ')[0].trim() === 'end');
  }
}
