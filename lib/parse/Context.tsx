const Clone = require('clone');
const HtmlDecode = (require('he') as any).decode;
const Math = require('mathjs') as any;
import * as seedrandom from 'seedrandom'

export function generateSeed(): string {
  let seed: string = '';
  seedrandom(undefined, { pass: function(p: seedrandom.prng, s: string): seedrandom.prng {
    seed = s;
    return p;
  }});
  return seed;
}

export interface Context {
  // Scope is passed to the parser when rendering
  // nodes that are potentially parseable via MathJS.
  scope: any; // TODO: required fields later

  views: {[id:string]: number};

  // The list of choices, events, and jumps that produced this context, serialized.
  // Given the path and original quest XML, we should be able to recreate
  // context given this path.
  path: (string|number)[];

  // Regenerate template scope (all of "_") with this function.
  _templateScopeFn: () => any;

  // Optional contextual arg to seed the random number generator.
  seed?: string;
}

export function defaultContext(): Context {
  const populateScopeFn = function() {
    return {
      viewCount: function(id: string): number {
        return this.views[id] || 0;
      },
    };
  };

  // Caution: Scope is the API for Quest Creators.
  // New endpoints should be added carefully b/c we'll have to support them.
  // Behind-the-scenes data can be added to the context outside of scope
  const newContext: Context = {
    scope: {
      _: populateScopeFn(),
    },
    views: {},
    path: ([] as any),
    _templateScopeFn: populateScopeFn, // Used to refill template scope elsewhere (without dependencies)
  };

  for (const k of Object.keys(newContext.scope._)) {
    newContext.scope._[k] = (newContext.scope._[k] as any).bind(newContext);
  }

  return newContext;
}

// Run MathJS over all detected {{operations}}.
export function evaluateContentOps(content: string, ctx: Context): string {
  // {{.+?(?=}})}}       Match "{{asdf\n1234}}"
  // |                   Or
  // .+?(?={{|$)         Nongreedy characters (including whitespace) until "{{" or end of string
  // /g                  Multiple times
  const matches = content.match(/{{[\s\S]+?(?=}})}}|[\s\S]+?(?={{|$)/g);
  if (!matches) {
    return content;
  }

  let result = '';
  for (const m of matches) {
    const op = parseOpString(m);
    if (op) {
      const evalResult = evaluateOp(op, ctx);
      if (evalResult || evalResult === 0) {
        result += evalResult;
      }
    } else {
      result += m;
    }
  }

  return result.trim();
}

// Attempts to evaluate op using ctx.
// If the evaluation is successful, the context is modified as determined by the op.
// If the last operation does not assign a value, the result is returned.
export function evaluateOp(op: string, ctx: Context): any {
  let parsed;
  let evalResult;
  try {
    parsed = Math.parse(HtmlDecode(op));
    evalResult = parsed.compile().eval(ctx.scope);
  } catch (err) {
    const message = err.message + ' Op: (' + op + ')';
    if (self && !self.document) { // webworker
      return null;
    } else if (window && window.onerror) {
      window.onerror(message, 'expedition-qdl/parse/context');
      return null;
    } else {
      throw new Error(message);
    }
  }

  // Only return the result IF it doesn't assign a value as its last action.
  if (!lastExpressionAssignsValue(parsed)) {

    // If ResultSet, then unwrap it and get the last value.
    // http://mathjs.org/docs/reference/classes/resultset.html
    if (parsed.type === 'BlockNode') {
      const v = evalResult.valueOf();
      evalResult = v[v.length-1];
    }

    if (evalResult.length === 1) {
      // If we're a single-valued array, so unwrap the value.
      evalResult = evalResult[0];
    } else if (evalResult.size) {
      // We have a single-valued matrix result, so unwrap the value.
      // http://mathjs.org/docs/datatypes/matrices.html
      const size = evalResult.size();
      if (size.length === 1 && size[0] === 1) {
        evalResult = evalResult.get([0]);
      }
    }
    return evalResult;
  }
  return null;
}

function lastExpressionAssignsValue(parsed: any): boolean {
  if (parsed.type === 'BlockNode') {
    return lastExpressionAssignsValue(parsed.blocks[parsed.blocks.length-1].node);
  }
  return (parsed.type === 'AssignmentNode' || parsed.type === 'FunctionAssignmentNode');
}

function parseOpString(str: string): string | null {
  const op = str.match(/{{([\s\S]+?)}}/);
  if (!op) {
    return null;
  }
  return op[1];
}

export function updateContext<C extends Context>(node: Cheerio, ctx: C, action?: string|number): C {
  if (!node) {
    return ctx;
  }

  const nodeId = node.attr('id');

  const newContext: C = Clone(ctx);

  if (nodeId) {
    newContext.views[nodeId] = (newContext.views[nodeId] || 0) + 1;
  }
  if (action !== undefined) {
    newContext.path.push(action);
  }

  // Create new copies of all scope functions and bind them
  newContext.scope._ = newContext._templateScopeFn();
  for (const k of Object.keys(newContext.scope._)) {
    newContext.scope._[k] = (newContext.scope._[k] as any).bind(newContext);
  }

  // Update random seed
  newContext.seed = generateSeed();

  return newContext;
}
