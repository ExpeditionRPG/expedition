import {Logger} from '../../render/Logger';
import {TemplateBodyType, TemplateChild} from './Templates';

export enum Persona {
  LIGHT = 'light',
  DARK = 'dark',
}
export enum Skill {
  ATHLETICS = 'athletics',
  KNOWLEDGE = 'knowledge',
  CHARISMA = 'charisma',
}
export enum Outcome {
  SUCCESS = 'success',
  FAILURE = 'failure',
  RETRY = 'retry',
  INTERRUPTED = 'interrupted',
}

// We promise to give sane defaults for all but the following outcomes
const REQUIRED_OUTCOMES: Outcome[] = [Outcome.SUCCESS, Outcome.FAILURE];

export const MIN_CHECKS_FOR_DECISION = 3;

function enumValues(e: any): string[] {
  return Object.keys(e).map((k) => e[k]);
}

function matchEnum(e: any): string {
  return enumValues(e).join('|');
}

const skillCheckMatcher = new RegExp(`^(${matchEnum(Persona)})?\\s?(${matchEnum(Skill)})\\s?(${matchEnum(Outcome)})?$`);
const genericOutcomeMatcher = new RegExp(`^(${matchEnum(Outcome)})$`);

export function getPossibleChecks(ss: Array<{persona: string|undefined, skill: string|undefined}>): string[] {
  const result: string[] = [];

  const skills: {[skill: string]: boolean} = {};
  const skillPersonas: {[skill: string]: string[]} = {};
  for (const s of ss) {
    if (!s.skill) {
      continue;
    }
    skills[s.skill] = true;

    if (!s.persona) {
      continue;
    }
    skillPersonas[s.skill] = skillPersonas[s.skill] || [];
    skillPersonas[s.skill].push(s.persona);
  }

  for (const s of Object.keys(skills)) {
    if (!skillPersonas[s]) {
      result.push(s);
      continue;
    }
    for (const p of skillPersonas[s]) {
      result.push(`${p} ${s}`);
    }
  }
  return result;
}

export function sanitizeDecision(attribs: {[k: string]: any}, body: TemplateBodyType, line: number, defaultOutcome: () => any, log: Logger): {body: TemplateBodyType, attribs: {[k: string]: any}} {
  const sanitized: TemplateBodyType = [];

  const bullets: Array<{persona: string|undefined, skill: string|undefined, outcome: string|undefined}> = [];
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
    const skillMatch = child.text.match(skillCheckMatcher);
    if (skillMatch) {
      bullets.push({persona: skillMatch[1], skill: skillMatch[2], outcome: skillMatch[3] || 'success'});
    } else {
      if (!genericOutcomeMatcher.test(child.text)) {
        log.err('Invalid skill check: "' + child.text + '"', '422', line);
        continue;
      }
      bullets.push({persona: undefined,  skill: undefined, outcome: child.text});
    }
    sanitized.push(section);
  }

  // Calculate the possible skill checks and coverage of outcomes
  const coverage: {[check: string]: {[outcome: string]: boolean}} = {};
  getPossibleChecks(bullets).forEach((c) => coverage[c] = {});
  for (const b of bullets) {
    const oc = b.outcome || 'success';
    if (b.persona && b.skill) {
      coverage[`${b.persona} ${b.skill}`][oc] = true;
    } else if (b.skill) { // Non-persona skill bullet
      if (coverage[`${b.skill}`]) {
        coverage[`${b.skill}`][oc] = true;
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
