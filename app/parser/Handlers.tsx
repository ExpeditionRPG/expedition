import * as React from 'react'
import {XMLElement, DOMElement} from '../reducers/StateTypes'
import {Choice, defaultQuestContext, Enemy, EventParameters, RoleplayElement, QuestCardName, QuestContext} from '../reducers/QuestTypes'
import {encounters} from '../Encounters'
import {ParserNode} from './Node'
import {evaluateOp, evaluateContentOps, updateContext} from './Context'

export interface CombatResult {
  type: 'Combat';
  icon: string;
  enemies: Enemy[];
  ctx: QuestContext;
}

export interface RoleplayResult {
  type: 'Roleplay';
  icon: string;
  title: string;
  content: RoleplayElement[];
  choices: Choice[];
  ctx: QuestContext;
}

export interface TriggerResult {
  type: 'Trigger';
  node: XMLElement;
  name: string;
}

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
export function handleAction(parent: XMLElement, action: number|string, ctx: QuestContext): XMLElement {
  let pnode = (new ParserNode(parent, ctx)).getNext(action);
  if (!pnode) {
    return null;
  }

  // Immediately act on any gotos
  while (pnode.elem.get(0).tagName === 'trigger') {
    let id = getTriggerId(pnode.elem);
    if (id) {
      pnode = pnode.gotoId(id);
    } else {
      break;
    }
  }
  return (pnode) ? pnode.elem : null;
}

export function loadCombatNode(node: XMLElement, ctx: QuestContext): CombatResult {
  let enemies: Enemy[] = [];

  const newContext = updateContext(node, ctx);

  // Track win and lose events for validation
  let winEventCount = 0;
  let loseEventCount = 0;
  (new ParserNode(node, newContext)).loopChildren((tag, c) => {
    switch (tag) {
      case 'e':
        let text = c.text();

        // Replace text if it's an op string.
        // If the string fails to evaluate, the original op is returned as text.
        const evalResult = evaluateContentOps(text, newContext);
        if (evalResult) {
          text = evalResult + '';
        }

        const encounter = encounters[text.toLowerCase()];

        if (!encounter) {
          // If we don't know about the enemy, just assume tier 1.
          enemies.push({name: text, tier: 1});
        } else {
          enemies.push({name: encounter.name, tier: encounter.tier, class: encounter.class});
        }
        break;
      case 'event':
        switch (c.attr('on')) {
          case 'win':
            winEventCount++;
            break;
          case 'lose':
            loseEventCount++;
            break;
        }
        break;
      default:
        throw new Error('Invalid child element: ' + tag);
    }
  });

  if (winEventCount === 0) {
    throw new Error('<combat> must have at least one conditionally true child with on="win"');
  }

  if (loseEventCount === 0) {
    throw new Error('<combat> must have at least one conditionally true child with on="lose"');
  }

  if (!enemies.length) {
    throw new Error('<combat> has no <e> children');
  }

  // Combat is stateless, so newContext is not returned here.
  return {
    type: 'Combat',
    icon: node.attr('icon'),
    enemies,
    ctx,
  };
}

export function loadRoleplayNode(node: XMLElement, ctx: QuestContext): RoleplayResult {
  
  // Append elements to contents
  let choices: Choice[] = [];
  let choiceCount = -1;
  let children: RoleplayElement[] = [];

  const newContext = updateContext(node, ctx);
  const pnode = new ParserNode(node, newContext);

  pnode.loopChildren((tag, c) => {
    c = c.clone();

    // Accumulate 'choice' tags in choices[]
    if (tag === 'choice') {
      choiceCount++;
      if (!c.attr('text')) {
        throw new Error('<choice> inside <roleplay> must have "text" attribute');
      }
      const text = c.attr('text');
      choices.push({text: generateIconElements(evaluateContentOps(text, newContext)), idx: choiceCount});
      return;
    }

    if (tag === 'event') {
      throw new Error('<roleplay> cannot contain <event>.');
    }

    const element: RoleplayElement = {
      type: 'text',
      text: '',
    }
    if (tag === 'instruction') {
      element.type = 'instruction';
      element.text = c.html();
    } else { // text
      // If we received a Cheerio object, outerHTML will
      // not be defined. toString will be, however.
      // https://github.com/cheeriojs/cheerio/issues/54
      if (c.get(0).outerHTML) {
        element.text = c.get(0).outerHTML;
      } else if (c.toString) {
        element.text = c.toString();
      } else {
        throw new Error('Invalid element ' + c);
      }
    }

    element.text = generateIconElements(evaluateContentOps(element.text, newContext));

    if (element.text !== '') {
      children.push(element);
    }
  });

  // Append a generic 'Next' button if there were no choices,
  // or an 'End' button if there's also an <End> tag.
  if (choices.length === 0) {
    // Handle custom generic next button text based on if we're heading into a trigger node.
    const nextNode = pnode.getNext();
    let buttonText = 'Next';
    if (nextNode && nextNode.elem.get(0).tagName.toLowerCase() === 'trigger') {
      switch(nextNode.elem.text().toLowerCase()) {
        case 'end':
          buttonText = 'End';
          break;
      }
    }
    choices.push({text: buttonText, idx: 0});
  }

  return {
    type: 'Roleplay',
    title: node.attr('title'),
    icon: node.attr('icon'),
    content: children,
    choices,
    ctx: newContext,
  };
}

export function loadTriggerNode(node: XMLElement): TriggerResult {
  const text = node.text().trim();
  if (text === 'end') {
    return {
      type: 'Trigger',
      node,
      name: 'end',
    };
  }
  throw new Error('invalid trigger ' + text);
}


// Replaces [icon_name] with <img class="inline_icon" src="images/icon_name.svg">
function generateIconElements(content: string): string {
  // \[([a-zA-Z_0-9]*)\]   Contents inside of []'s, only allowing for alphanumeric + _'s
  // /g                    Multiple times
  return content.replace(/\[([a-zA-Z_0-9]*)\]/g, (match:string, group:string): string => {
    return `<img class="inline_icon" src="images/${group}_small.svg">`;
  });
}