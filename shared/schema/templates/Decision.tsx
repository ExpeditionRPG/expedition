import {Logger} from '../../render/Logger';
import {TemplateBodyType, TemplateChild} from './Templates';

export enum Persona {
  light = 'light',
  dark = 'dark',
}
export enum Skill {
  athletics = 'athletics',
  knowledge = 'knowledge',
  charisma = 'charisma',
}
export enum Outcome {
  success = 'success',
  failure = 'failure',
  retry = 'retry',
  interrupted = 'interrupted',
}

export interface SkillCheck {
  persona?: (keyof typeof Persona);
  skill?: (keyof typeof Skill);
  outcome?: (keyof typeof Outcome);
}

// We promise to give sane defaults for all but the following outcomes
const REQUIRED_OUTCOMES: Outcome[] = [Outcome.success, Outcome.failure];

export const MIN_CHECKS_FOR_DECISION = 3;

function enumValues(e: any): string[] {
  return Object.keys(e).map((k) => e[k]);
}

function matchEnum(e: any): string {
  return enumValues(e).join('|');
}

const skillCheckMatcher = new RegExp(`^(${matchEnum(Persona)})?\\s?(${matchEnum(Skill)})?\\s?(${matchEnum(Outcome)})?$`);
const eventMatcher = new RegExp(`^on\\s(.*)$`);
export function extractSkillCheck(s: string): SkillCheck|null {
  const skillMatch = s.match(skillCheckMatcher);
  if (!skillMatch) {
    return null;
  }
  return {
    persona: (Persona as any)[skillMatch[1]],
    skill: (Skill as any)[skillMatch[2]],
    outcome: (Outcome as any)[skillMatch[3]],
  };
}

export function getPossibleChecks(ss: SkillCheck[]): SkillCheck[] {
  const result: SkillCheck[] = [];

  const skills: Partial<Record<keyof typeof Skill, boolean>> = {};
  const skillPersonas: Partial<Record<keyof typeof Skill, Array<keyof typeof Persona>>> = {};
  for (const s of ss) {
    if (!s.skill) {
      continue;
    }
    skills[s.skill] = true;

    if (!s.persona) {
      continue;
    }
    const sk = skillPersonas[s.skill] || [];
    sk.push(s.persona);
    skillPersonas[s.skill] = sk;
  }

  for (const k of Object.keys(skills)) {
    const s = (k as keyof typeof Skill);
    if (!skillPersonas[s]) {
      result.push({skill: s});
      continue;
    }
    for (const p of (skillPersonas[s] || [])) {
      result.push({persona: p, skill: s});
    }
  }
  return result;
}

export function sanitizeDecision(attribs: {[k: string]: any}, body: TemplateBodyType, line: number, defaultOutcome: () => any, log: Logger): {body: TemplateBodyType, attribs: {[k: string]: any}} {
  const sanitized: TemplateBodyType = [];

  const bullets: SkillCheck[] = [];
  for (const section of body) {
    if (!Boolean((section as TemplateChild).outcome)) {
      // Ignore whitespace
      if (section === '') {
        continue;
      }

      sanitized.push(section);
      continue;
    }

    // Check that the outcome is a valid skill check type or one of the reserved types
    const child = section as TemplateChild;
    const eventMatch = child.text.match(eventMatcher);
    if (!eventMatch || !eventMatch[1]) {
      log.err('Invalid skill check: "' + child.text + '"', '422', line);
      continue;
    }
    const text = eventMatch[1];

    const skillMatch = extractSkillCheck(text);
    if (!skillMatch || (skillMatch.persona && skillMatch.outcome && !skillMatch.skill)) {
      log.err('Invalid skill check: "' + text + '"', '422', line);
      continue;
    }
    skillMatch.outcome = skillMatch.outcome || 'success';
    bullets.push(skillMatch);
    sanitized.push(section);
  }

  // Calculate the possible skill checks and coverage of outcomes
  const coverage: {[check: string]: {[outcome: string]: boolean}} = {};
  getPossibleChecks(bullets).forEach((c) => {
    const str: string = (c.persona && c.skill) ? `${c.persona} ${c.skill}` : c.skill || '';
    coverage[str] = {};
  });
  for (const b of bullets) {
    const oc = b.outcome || 'success';
    if (b.persona && b.skill) {
      coverage[`${b.persona} ${b.skill}`][oc] = true;
    } else if (b.skill) { // Non-persona skill bullet
      if (coverage[b.skill]) {
        coverage[b.skill][oc] = true;
      } else {
        for (const p of enumValues(Persona)) {
          if (coverage[`${p} ${b.skill}`]) {
            coverage[`${p} ${b.skill}`][oc] = true;
          }
        }
      }
    } else { // Generic bullet (outcome only)
      for (const c of Object.keys(coverage)) {
        coverage[c][oc] = true;
      }
    }
  }

  // Check for a minimum number of skill checks, and report skills missing coverage
  const missingOutcomes: {[check: string]: string[]} = {};
  for (const chk of Object.keys(coverage)) {
    for (const oc of REQUIRED_OUTCOMES) {
      if (!coverage[chk][oc]) {
        missingOutcomes[chk] = missingOutcomes[chk] || [];
        missingOutcomes[chk].push(oc);
        continue;
      }
    }
  }
  if (Object.keys(missingOutcomes).length > 0) {
    const errs: string[] = [];
    for (const chk of Object.keys(missingOutcomes)) {
      errs.push(`${chk} (${missingOutcomes[chk].join(', ')})`);
    }
    log.err('Skill checks missing outcomes: ' + errs.join(', '), '425', line);
  }

  const numChecks = Object.keys(coverage).length;
  if (numChecks < MIN_CHECKS_FOR_DECISION) {
    log.err(`Need at least ${MIN_CHECKS_FOR_DECISION} skill checks, have ${numChecks}`, '424', line);
  }

  return {body: sanitized, attribs};
}
