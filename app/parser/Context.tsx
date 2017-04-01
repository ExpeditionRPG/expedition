import * as React from 'react'
import {XMLElement} from '../reducers/StateTypes'
import {defaultQuestContext, QuestContext} from '../reducers/QuestTypes'

const Clone = require('clone');
const HtmlDecode = (require('he') as any).decode;
const Math = require('mathjs') as any;

// Run MathJS over all detected {{operations}}
export function evaluateContentOps(content: string, ctx: QuestContext): string {
  // {{.+?(?=}})}}       Match "{{asdf\n1234}}"
  // |                   Or
  // .+?(?={{|$)         Nongreedy characters (including whitespace) until "{{" or end of string
  // /g                  Multiple times
  const matches = content.match(/{{[\s\S]+?(?=}})}}|[\s\S]+?(?={{|$)/g);

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

  // Don't return lines that parsed into nothing
  if (content !== result && result.replace(/\s/g,'') === '<p></p>') {
    return '';
  }
  return result;
}

// If it's an operation, run it with our context.
export function evaluateOp(op: string, ctx: QuestContext): any {
  const parsed = Math.parse(HtmlDecode(op));
  let evalResult;

  try {
    evalResult = parsed.compile().eval(ctx.scope);
  } catch(e) {
    return null;
  }

  // Only add the result to content IF it doesn't assign a value as its last action.
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
}

function lastExpressionAssignsValue(parsed: any): boolean {
  if (parsed.type === 'BlockNode') {
    return lastExpressionAssignsValue(parsed.blocks[parsed.blocks.length-1].node);
  }
  return (parsed.type === 'AssignmentNode' || parsed.type === 'FunctionAssignmentNode');
}

export function parseOpString(str: string): string {
  const op = str.match(/{{([\s\S]+?)}}/);
  if (!op) {
    return null;
  }
  return op[1];
}

export function updateContext(node: XMLElement, ctx: QuestContext): QuestContext {
  const defaults = defaultQuestContext();
  const newContext = Clone(ctx);
  const nodeId = node.attr('id');
  if (nodeId) {
    newContext.views[nodeId] = (newContext.views[nodeId] || 0) + 1;
  }
  newContext.scope._.viewCount = defaults.scope._.viewCount.bind(newContext);
  return newContext;
}