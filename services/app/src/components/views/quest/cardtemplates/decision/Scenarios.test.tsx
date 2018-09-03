import {Outcome, Persona, Skill} from 'shared/schema/templates/Decision';
import {getScenarioInstruction} from './Scenarios';

describe('combat decision scenarios', () => {
  describe('getScenarioInstruction', () => {
    for (const p of Object.keys(Persona)) {
      for (const s of Object.keys(Skill)) {
        for (const o of [Outcome.success, Outcome.failure]) {
          test(`has value for ${p} ${s} ${o}`, () => {
            expect(getScenarioInstruction({persona: (p as any as Persona), skill: (s as any as Skill)}, o as any as Outcome, () => 0)).toBeDefined();
          });
        }
      }
    }
  });
});
