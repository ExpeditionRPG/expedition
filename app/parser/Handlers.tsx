import * as React from 'react'
import {XMLElement, DOMElement} from '../reducers/StateTypes'
import {Choice, defaultQuestContext, Enemy, EventParameters, RoleplayElement, QuestCardName, QuestContext} from '../reducers/QuestTypes'
import {ParserNode} from './Node'

// The passed event parameter is a string indicating which event to fire based on the "on" attribute.
// Returns the (cleaned) parameters of the event element
export function getEventParameters(parent: XMLElement, event: string, ctx: QuestContext): EventParameters {
  const evt = (new ParserNode(parent, ctx)).getNext(event);
  if (!evt) {
    return null;
  }
  const p = evt.elem.parent();
  const ret: EventParameters = {};
  if (p.attr('xp')) { ret.xp = (p.attr('xp') == 'true'); }
  if (p.attr('loot')) { ret.loot = (p.attr('loot') == 'true'); }
  if (p.attr('heal')) { ret.heal = parseInt(p.attr('heal'), 10); }
  return ret;
}

function getTriggerId(elem: XMLElement): string {
  const m = elem.text().trim().match(/\s*goto\s+(.*)/);
  return (m) ? m[1] : null;
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

  // Immediately act on any gotos (with a max depth)
  let i = 0;
  for (; i < 100 && pnode.getTag() === 'trigger'; i++) {
    let id = getTriggerId(pnode.elem);
    if (id) {
      pnode = pnode.gotoId(id);
    } else {
      break;
    }
  }

  if (i >= 100) {
    throw new Error('Trigger follow depth exceeded');
  }
  return pnode;
}