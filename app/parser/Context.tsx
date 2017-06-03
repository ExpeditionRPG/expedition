import * as React from 'react'
import {CheerioElement} from '../reducers/StateTypes'
import {defaultQuestContext, QuestContext, linkQuestContext} from '../reducers/QuestTypes'

const Clone = require('clone');
const HtmlDecode = (require('he') as any).decode;
const Math = require('mathjs') as any;

const SER_STRING_TAG = '@s|';
const SER_FUN_TAG = '@f|';

/*
// Serialize the quest context.
export function serializeContext(ctx: QuestContext): string {
  ctx = Clone(ctx);

  // Cast scope functions to strings, to ensure future changes to context functions
  // don't affect contexts serialized long in the past.
  // We prepend a "tag" to identify which strings are just strings and which are
  // actually functions when deserializing.
  for (let k of Object.keys(ctx.scope._)) {
    switch (typeof(ctx.scope._[k])) {
      case 'function':
        ctx.scope._[k] = SER_FUN_TAG + ctx.scope._[k].toString();
        break;
      case 'string':
        ctx.scope._[k] = SER_STRING_TAG + ctx.scope._[k];
        break;
      default:
        break;
    }
  }

  return JSON.stringify(ctx);
}

// Deserialize the quest context string, adding in
export function deserializeContext(ctxString: string): QuestContext {
  var ctx = JSON.parse(ctxString, Math.json.reviver);

  // Convert string-cast functions back to real functions and remove tags.
  for (let k of Object.keys(ctx.scope._)) {
    if (typeof(ctx.scope._[k]) !== 'string') {
      continue;
    }
    if (ctx.scope._[k].startsWith(SER_FUN_TAG)) {
      // Use eval to turn function-string into function expression.
      // Parens wrap the function to prevent ambiguity (could be parsed as a function definition otherwise)
      // https://stackoverflow.com/questions/2760953/javascript-eval-syntax-error-on-parsing-a-function-string
      const value = ctx.scope._[k].substr(SER_FUN_TAG.length);
      const args = value.substring(value.indexOf('(') + 1, value.indexOf(')'))
      const body = value.substring(value.indexOf('{') + 1, value.lastIndexOf('}'));
      ctx.scope._[k] = new Function(args, body);
    } else if (ctx.scope._[k].startsWith(SER_STRING_TAG)) {
      ctx.scope._[k] = ctx.scope._[k].substr(SER_STRING_TAG.length);
    }
  }

  return linkQuestContext(ctx);
}
*/

// Run MathJS over all detected {{operations}}.
export function evaluateContentOps(content: string, ctx: QuestContext): string {
  // {{.+?(?=}})}}       Match "{{asdf\n1234}}"
  // |                   Or
  // .+?(?={{|$)         Nongreedy characters (including whitespace) until "{{" or end of string
  // /g                  Multiple times
  const matches = content.match(/{{[\s\S]+?(?=}})}}|[\s\S]+?(?={{|$)/g);
  if (!matches) {
    return content;
  }

  let result = '';
  for (let m of matches) {
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
export function evaluateOp(op: string, ctx: QuestContext): any {
  const parsed = Math.parse(HtmlDecode(op));
  let evalResult;

  try {
    evalResult = parsed.compile().eval(ctx.scope);
  } catch(e) {
    return null;
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

function parseOpString(str: string): string {
  const op = str.match(/{{([\s\S]+?)}}/);
  if (!op) {
    return null;
  }
  return op[1];
}

export function updateContext(node: CheerioElement, ctx: QuestContext, action?: string|number): QuestContext {
  if (!node) {
    return ctx;
  }

  const nodeId = node.attr('id');
  let newContext: QuestContext = Clone(ctx);
  if (nodeId) {
    newContext.views[nodeId] = (newContext.views[nodeId] || 0) + 1;
  }
  if (action !== undefined) {
    newContext.path.push(action);
  }
  newContext.scope._.viewCount = defaultQuestContext().scope._.viewCount.bind(newContext);
  return newContext;
}
