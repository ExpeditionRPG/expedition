import {QuestContext} from '../reducers/QuestTypes'

const Clone = require('clone');
const HtmlDecode = (require('he') as any).decode;
const Math = require('mathjs') as any;

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

export function updateContext(node: Cheerio, ctx: QuestContext, action?: string|number): QuestContext {
  if (!node) {
    return ctx;
  }

  const nodeId = node.attr('id');

  // Special handling of roleplay node - this is readonly and cannot be cloned.
  let tmpCombatRoleplay: any = null;
  if (ctx.templates && ctx.templates.combat && ctx.templates.combat.roleplay) {
    tmpCombatRoleplay = ctx.templates.combat.roleplay;
    ctx.templates.combat.roleplay = null;
  }

  const newContext: QuestContext = Clone(ctx);

  // Reassign readonly (uncopyable) attributes
  if (tmpCombatRoleplay) {
    newContext.templates.combat.roleplay = tmpCombatRoleplay.clone();
    ctx.templates.combat.roleplay = tmpCombatRoleplay;
  }

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
  return newContext;
}
