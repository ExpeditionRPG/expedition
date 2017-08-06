import {EventParameters} from '../reducers/QuestTypes'
import {ParserNode} from './Node'

const MAX_GOTO_FOLLOW_DEPTH = 50;

// The passed event parameter is a string indicating which event to fire based on the "on" attribute.
// Returns the (cleaned) parameters of the event element
export function getEventParameters(node: ParserNode, event: string): EventParameters {
  const evt = node.getNext(event);
  if (!evt) {
    return null;
  }
  const p = evt.elem.parent();
  const ret: EventParameters = {};
  if (p.attr('xp')) { ret.xp = (p.attr('xp') === 'true'); }
  if (p.attr('loot')) { ret.loot = (p.attr('loot') === 'true'); }
  if (p.attr('heal')) { ret.heal = parseInt(p.attr('heal'), 10); }
  return ret;
}

function getTriggerId(elem: Cheerio): string {
  const m = elem.text().trim().match(/\s*goto\s+(.*)/);
  return (m) ? m[1] : null;
}

export function handleTriggerEvent(pnode: ParserNode): ParserNode {
  // Search upwards in the node heirarchy and see if any of the parents successfully
  // handle the event.
  let ref = new ParserNode(pnode.elem.parent(), pnode.ctx);
  const event = pnode.elem.text().trim();
  while (ref.elem && ref.elem.length > 0) {
    const handled = handleAction(ref, event);
    if (handled !== null) {
      return handled;
    }
    ref = new ParserNode(ref.elem.parent(), pnode.ctx);
  }

  // Return the trigger unchanged if a handler is not found.
  return pnode;
}

function handleTrigger(pnode: ParserNode): ParserNode {
  // Immediately act on any gotos (with a max depth)
  let i = 0;
  for (; i < MAX_GOTO_FOLLOW_DEPTH && pnode !== null && pnode.getTag() === 'trigger'; i++) {
    const id = getTriggerId(pnode.elem);
    if (id) {
      pnode = pnode.gotoId(id);
    } else {
      return handleTriggerEvent(pnode);
    }
  }
  if (i >= MAX_GOTO_FOLLOW_DEPTH) {
    return null;
  }
  return pnode;
}

// The passed action parameter is either
// - a number indicating the choice number in the XML element, including conditional choices.
// - a string indicating which event to fire based on the "on" attribute.
// Returns the card inside of / referenced by the choice/event element
export function handleAction(pnode: ParserNode, action: number|string): ParserNode {
  pnode = pnode.getNext(action);
  if (!pnode) {
    return null;
  }

  if (pnode.getTag() === 'trigger') {
    return handleTrigger(pnode);
  }
  return pnode;
}
