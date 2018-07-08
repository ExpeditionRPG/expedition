export interface Instruction {text: string; visible?: string; }

export type TemplateType = 'roleplay' | 'combat' | 'decision';

export const TEMPLATE_TYPES: TemplateType[] = ['roleplay', 'combat', 'decision'];

// If null, the event has no attributes and instead has a text block.
export const TEMPLATE_ATTRIBUTE_MAP: {[e: string]: string|null} = {
  combat: 'enemies',
  roleplay: null,
  decision: null,
};

export const TEMPLATE_ATTRIBUTE_SHORTHAND: {[k: string]: string} = {
  enemies: 'e',
};

export function getTemplateType(header: string): TemplateType|null {
  for (const t of TEMPLATE_TYPES) {
    if (header === t) {
      return t;
    }
  }
  return null;
}

export interface TemplateChild {
  text: string;
  visible?: string;
  outcome: any[]; // Outcomes are either choices or events - events begin with "on ", and choices do not.
  json?: any;
}

export type TemplateBodyType = Array<string|TemplateChild|Instruction>;
