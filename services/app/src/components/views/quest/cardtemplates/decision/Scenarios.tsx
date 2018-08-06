/* tslint:disable:object-literal-sort-keys */
import {Outcome, Persona, Skill, SkillCheck} from 'shared/schema/templates/Decision';

interface ScenarioMap {[p: string]: {[s: string]: Array<Partial<Record<keyof typeof Outcome, string[]>>>}; }

// TODO: Scenarios could use some kind of QDL-based conditional, e.g. you could have certain cases where scenarios only
// happen when there's guaranteed to be more than one enemy, or if all other adventurers are dead, etc.
// TODO: Rewards can be throttled up and down with difficulty by only showing e.g. 1 of 3 instructions if it's an easy check, or 2 if normal, or 3 if hard.
const SCENARIOS: ScenarioMap = {
  [Persona.light]: {
    [Skill.athletics]: [
      {
        success: ['The adventurer that succeeded the check regains 2 health'],
        failure: ['All adventurers that rolled for the check lose 1 health'],
      },
      {
        success: ['The adventurer that succeeded the check gains +3 damage next round.'],
        failure: ['The last adventurer to roll for this check takes 1 damage.'],
      },
      {
        success: ['All adventurers that rolled for the check gain 1 health.', '1 target takes 1 damage.'],
        failure: ['The last adventurer to roll for this check takes 1 damage.'],
      },
      {
        success: ['Deal 2 damage to one target'],
        failure: ['All adventurers that rolled for the check lose 1 health'],
      },
    ],
    [Skill.knowledge]: [
      {
        success: ['Each adventurer that rolled for this check draws 1 Tier I Loot.'],
        failure: ['Each adventurer that rolled for this check takes 1 damage.'],
      },
      {
        success: ['The adventurer that succeeded the check learns 1 ability of a type they already have.'],
        failure: ['The last adventurer to roll for this check must play the top ability card of their deck as D20=1.'],
      },
    ],
    [Skill.charisma]: [
      {
        success: ['All adventurers that did not roll for the check regain 1 health.'],
        failure: ['All enemies with nonzero health regain 1 health.'],
      },
      {
        success: ['Cancel the lowest tier enemy\'s next surge effect (place a token on them to track).'],
        failure: ['Carry out the surge effect of the lowest tier enemy.'],
      },
    ],
  },
  [Persona.dark]: {
    [Skill.athletics]: [
      {
        success: ['Deal 2 damage to one target.', 'Reduce damage taken this round by 1'],
        failure: ['The last adventurer to roll for this check takes 1 damage.'],
      },
      {
        success: ['Enemies deal 2 less damage next round'],
        failure: ['All adventurers that rolled for the check take +1 damage from enemies next round.'],
      },
      {
        success: ['The adventurer that succeeded the check  gains 1 Tier I loot.'],
        failure: ['One adventurer that rolled for the check loses 1 Tier I loot.'],
      },
    ],
    [Skill.knowledge]: [
      {
        success: ['Deal 3 damage to 1 target'],
        failure: ['Enemies take 1 less damage from abilities this round.'],
      },
      {
        success: ['All adventurers that rolled for the check gain 1 Persona.'],
        failure: ['All adventurers that rolled for the check lose 1 Persona.'],
      },
    ],
    [Skill.charisma]: [
      {
        success: ['Carry out the effects of an enemy\'s surge on itself, replacing "enemy" for "adventurer" and vice versa.'],
        failure: ['The last adventurer to roll for this check takes 1 damage.'],
      },
    ],
  },
};

export function getScenarioInstruction(s: SkillCheck, outcome: keyof typeof Outcome, rng: () => number) {
  const checks = SCENARIOS[s.persona || Persona.light][s.skill || Skill.athletics];
  return checks[Math.floor(rng() * checks.length)][outcome];
}
