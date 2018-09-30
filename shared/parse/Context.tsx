const Clone = require('clone');
const HtmlDecode = (require('he') as any).decode;
const MathJS = require('mathjs');
const seedrandom = require('seedrandom');

// Later versions of MathJS come with a breaking change where
// strings are compared semantically (i.e. parsed for a numeric
// value and then compared) instead of literally (matching character-by-character),
// which results in e.g. "1" == "a" throwing an exception when
// "a" can't be parsed into a number.
// The following code overrides the equality operator in order to make the behavior
// expected/sane.
//
// https://github.com/josdejong/mathjs/issues/1051#issuecomment-369930811
MathJS.import({
  equal(a: any, b: any) { return a === b; },
}, {override: true});

export function generateSeed(prevSeed?: string): string {
  let seed: string = '';
  seedrandom(prevSeed && (prevSeed + seedrandom.alea(prevSeed)), { pass(p: seedrandom.prng, s: string): seedrandom.prng {
    seed = s;
    return p;
  }});
  return seed;
}

export interface Context {
  // Scope is passed to the parser when rendering
  // nodes that are potentially parseable via MathJS.
  scope: any; // TODO: required fields later

  views: {[id: string]: number};

  // The list of choices, events, and jumps that produced this context, serialized.
  // Given the path and original quest XML, we should be able to recreate
  // context given this path.
  path: Array<string|number>;

  // Regenerate template scope (all of "_") with this function.
  _templateScopeFn: () => any;

  // Optional contextual arg to seed the random number generator.
  seed?: string;
}

export function defaultContext(): Context {
  const populateScopeFn = () => {
    return {
      viewCount(id: string): number {
        return this.views[id] || 0;
      },
    };
  };

  // Caution: Scope is the API for Quest Creators.
  // New endpoints should be added carefully b/c we'll have to support them.
  // Behind-the-scenes data can be added to the context outside of scope
  const newContext: Context = {
    _templateScopeFn: populateScopeFn, // Used to refill template scope elsewhere (without dependencies)
    path: ([] as any),
    scope: {
      _: populateScopeFn(),
    },
    seed: generateSeed(),
    views: {},
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
  const rng = seedrandom.alea(ctx.seed || generateSeed());
  for (const m of matches) {
    const op = parseOpString(m);
    if (op) {
      const evalResult = evaluateOp(op, ctx, rng);
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
export function evaluateOp(op: string, ctx: Context, rng: () => number = Math.random): any {
  let parsed;
  let evalResult;

  // override random functions to use seed
  const random = (v1?: number, v2?: number) => {
    const r = rng();
    if (v2 !== undefined && v1 !== undefined) {
      return r * (v2 - v1) + v1; // v1 = min, v2 = max
    } else if (v1 !== undefined) {
      return r * v1; // v1 = max
    } else {
      return r;
    }
  };
  MathJS.import({
    random,
    randomInt(v1?: number, v2?: number) { return Math.floor(random(v1, v2)); },
    pickRandom(a: {_data: any[]}) { return a._data[Math.floor(random(a._data.length))]; },
  }, {override: true});

  try {
    parsed = MathJS.parse(HtmlDecode(op));
    evalResult = parsed.compile().eval(ctx.scope);
  } catch (err) {
    const message = err.message + ' Op: (' + op + ')';
    if (self && !self.document) { // webworker
      return null;
    } else if (window && window.onerror) {
      window.onerror(message, 'shared/parse/context');
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
      evalResult = v[v.length - 1];
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
    return lastExpressionAssignsValue(parsed.blocks[parsed.blocks.length - 1].node);
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
  if (action !== undefined && action !== null) {
    newContext.path.push(action);
  }

  // Create new copies of all scope functions and bind them
  newContext.scope._ = newContext._templateScopeFn();
  for (const k of Object.keys(newContext.scope._)) {
    newContext.scope._[k] = (newContext.scope._[k] as any).bind(newContext);
  }

  // Update random seed (using the previous seed)
  newContext.seed = generateSeed(newContext.seed);

  return newContext;
}
