import { Cheerio } from '../Cheerio';
import { MathJS } from '../MathJS';

const Clone = require('clone');
const HtmlDecode = require('he').decode;
// @types/seedrandom 3 dropped the global UMD namespace (and renamed `prng` to
// `PRNG`), so the callback signature below needs the module's own types.
import * as seedrandom from 'seedrandom';

export function generateSeed(prevSeed?: string): string {
  let seed: string = '';
  seedrandom(prevSeed && prevSeed + seedrandom.alea(prevSeed), {
    pass(p: seedrandom.PRNG, s: string): seedrandom.PRNG {
      seed = s;
      return p;
    },
  });
  return seed;
}

export interface Context {
  // Scope is passed to the parser when rendering
  // nodes that are potentially parseable via MathJS.
  scope: any; // TODO: required fields later

  views: { [id: string]: number };

  // The list of choices, events, and jumps that produced this context, serialized.
  // Given the path and original quest XML, we should be able to recreate
  // context given this path.
  path: Array<string | number>;

  // Optional contextual arg to seed the random number generator.
  seed?: string;
}

export function defaultContext(populateScope: () => any = () => ({})): Context {
  // Caution: Scope is the API for Quest Creators.
  // New endpoints should be added carefully b/c we'll have to support them.
  // Behind-the-scenes data can be added to the context outside of scope
  const newContext: Context = {
    path: [],
    scope: {
      // Lodash functions are UNBOUND - binding to the context is done dynamically
      // within evaluateOp so that we don't have to keep track of unbound copies
      // of the functions elsewhere.
      //
      // Do not rely on calling these methods directly, as they will not return
      // the correct values.
      _: populateScope(),
    },
    seed: generateSeed(),
    views: {},
  };
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
export function evaluateOp(
  op: string,
  ctx: Context,
  rng: () => number = Math.random,
): any {
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
  MathJS.import(
    {
      random,
      randomInt(v1?: number, v2?: number) {
        return Math.floor(random(v1, v2));
      },
      pickRandom(a: { _data: any[] }) {
        return a._data[Math.floor(random(a._data.length))];
      },
    },
    { override: true },
  );

  // Bind all scope functions, keeping a copy of the originals.
  // Note that .bind() returns a new (bound) function
  // that cannot be re-bound.
  const origLodash: any = { ...ctx.scope._ };
  for (const k of Object.keys(ctx.scope._)) {
    ctx.scope._[k] = ctx.scope._[k].bind(ctx);
  }

  try {
    parsed = MathJS.parse(HtmlDecode(op));
    // mathjs 6 renamed `eval` to `evaluate` on both the namespace and the
    // compiled-expression object.
    evalResult = parsed.compile().evaluate(ctx.scope);
  } catch (err) {
    const message =
      (err instanceof Error ? err.message : String(err)) + ' Op: (' + op + ')';
    if (self && self.document && window && window.onerror) {
      window.onerror(message, 'shared/parse/context');
      return null;
    } else {
      throw new Error(message, { cause: err });
    }
  } finally {
    // Replace bound scope functions with originals.
    ctx.scope._ = origLodash;

    // Subsequent calls to evaluateOp should use a deterministic
    // (but different) seed.
    ctx.seed = generateSeed(ctx.seed);
  }

  if (evalResult === undefined) {
    return null;
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
    return lastExpressionAssignsValue(
      parsed.blocks[parsed.blocks.length - 1].node,
    );
  }
  return (
    parsed.type === 'AssignmentNode' || parsed.type === 'FunctionAssignmentNode'
  );
}

function parseOpString(str: string): string | null {
  const op = str.match(/{{([\s\S]+?)}}/);
  if (!op) {
    return null;
  }
  return op[1];
}

export function updateContext<C extends Context>(
  node: Cheerio,
  ctx: C,
  action?: string | number,
): C {
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

  // Update random seed (using the previous seed)
  newContext.seed = generateSeed(newContext.seed);

  return newContext;
}
