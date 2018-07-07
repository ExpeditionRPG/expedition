import {Logger} from '../Logger';
import {Instruction} from './Renderer';
export type TemplateType = 'roleplay' | 'combat';

export interface TemplateChild {
  text: string;
  visible?: string;
  outcome: any[]; // Outomces are either choices or events - events begin with "on ", and choices do not.
  json?: any;
}

export const EVENT_TEMPLATE_TYPES: TemplateType[] = ['roleplay', 'combat'];

// If null, the event has no attributes and instead has a text block.
export const EVENT_ATTRIBUTE_MAP: {[e: string]: string|null} = {
  'combat': 'enemies',
  'roleplay': null,
};

export const EVENT_ATTRIBUTE_SHORTHAND: {[k: string]: string} = {
  'enemies': 'e',
  'skills': 's',
};

export function getTemplateType(header: string): TemplateType|null {
  // TODO
  return 'combat';
}

function isNumeric(n: any) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export type TemplateBodyType = Array<string|TemplateChild|Instruction>;

function sanitizeCombat(attribs: {[k: string]: any}, body: TemplateBodyType, line: number, defaultOutcome: any, log: Logger): {body: TemplateBodyType, attribs: {[k: string]: any}} {
  if (!attribs.enemies) {
    log.err('combat card has no enemies listed', '414', line);
    attribs.enemies = [{text: 'UNKNOWN'}];
  } else {
    // Validate tier if set
    for (const enemy of attribs.enemies) {
      if (enemy.json && enemy.json.tier) {
        const tier = enemy.json.tier;
        if (!isNumeric(tier) || tier < 1) {
          log.err('enemy tier must be a positive number', '418', line);
          continue;
        }
      }
    }
  }

  const sanitized: TemplateBodyType = [];

  // We should only ever see event blocks within the block.
  // These blocks are only single lines.
  let hasWin = false;
  let hasLose = false;
  for (const section of body) {
    if (!Boolean((section as TemplateChild).outcome)) {
      // Ignore whitespace
      if (section === '') {
        continue;
      }
      log.err(
        'lines within combat card must be events or enemies, not freestanding text',
        '416',
        line
      );
      continue;
    }
    const child = section as TemplateChild;
    hasWin = hasWin || (child.text === 'on win');
    hasLose = hasLose || (child.text === 'on lose');

    sanitized.push(section);
  }
  if (!hasWin) {
    log.err('combat card must have "on win" event', '417', line);
    sanitized.push({text: 'on win', outcome: [defaultOutcome]});
  }
  if (!hasLose) {
    log.err('combat card must have "on lose" event', '417', line);
    sanitized.push({text: 'on lose', outcome: [defaultOutcome]});
  }
  return {body: sanitized, attribs};
}

export function sanitizeTemplate(type: TemplateType, attribs: {[k: string]: any}, body: Array<string|TemplateChild|Instruction>, line: number, defaultOutcome: any, log: Logger): {body: TemplateBodyType, attribs: {[k: string]: any}} {
  switch (type) {
    case 'combat':
      return sanitizeCombat(attribs, body, line, defaultOutcome, log);
    case 'roleplay':
      return {body, attribs};
    default:
      throw new Error('unimplemented');
  }
}
