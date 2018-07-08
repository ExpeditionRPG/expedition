import {Logger, prettifyMsgs} from '../../render/Logger';
import {getPossibleChecks, sanitizeDecision} from './Decision';
import {TemplateBodyType} from './Templates';

function testSkillCheck(text: string) {
  return {text, outcome: []};
}

describe('Decision Template', () => {
  describe('getPossibleChecks', () => {
    it('allows for generic checks', () => {
      expect(getPossibleChecks([{persona: undefined, skill: 'knowledge'}])).toEqual(['knowledge']);
    });
    it ('uses only specific checks where possible', () => {
      expect(getPossibleChecks([
        {persona: undefined, skill: 'knowledge'},
        {persona: 'dark', skill: 'knowledge'},
      ])).toEqual(['dark knowledge']);
    });
    it ('uses only specific checks where possible', () => {
      expect(getPossibleChecks([
        {persona: undefined, skill: 'knowledge'},
        {persona: 'dark', skill: 'knowledge'},
      ])).toEqual(['dark knowledge']);
    });
    it ('handles a mix of generic and specific persona checks', () => {
      expect(getPossibleChecks([
        {persona: 'light', skill: 'knowledge'},
        {persona: 'dark', skill: 'knowledge'},
        {persona: undefined, skill: 'knowledge'},
        {persona: undefined, skill: 'athletics'},
      ])).toEqual(['light knowledge', 'dark knowledge', 'athletics']);
    });
  });

  describe('sanitizeDecision', () => {
    it('accepts a valid decision', () => {
      const log = new Logger();
      const attribs = {};
      const body: TemplateBodyType = [
        testSkillCheck('light knowledge'),
        testSkillCheck('dark knowledge'),
        testSkillCheck('athletics'),
        testSkillCheck('dark knowledge interrupted'),
        testSkillCheck('failure'),
      ];

      const sanitized = sanitizeDecision(attribs, body, 123, () => '', log);

      expect(sanitized.body).toEqual(body);
      expect(sanitized.attribs).toEqual(attribs);
      expect(prettifyMsgs(log.finalize())).toEqual('');
    });

    it('logs error when too few skill checks', () => {
      const log = new Logger();
      const attribs = {};
      // Note: generic outcomes don't count as skill checks
      const body: TemplateBodyType = [
        testSkillCheck('light athletics'),
        testSkillCheck('dark knowledge'),
        testSkillCheck('failure'),
      ];

      sanitizeDecision(attribs, body, 123, () => '', log);

      expect(prettifyMsgs(log.finalize())).toContain('URL: 424');
    });

    it('logs error on invalid skill check', () => {
      const log = new Logger();
      const attribs = {};
      // Note: generic outcomes don't count as skill checks
      const body: TemplateBodyType = [
        testSkillCheck('light'),
        testSkillCheck('light interrupted'),
        testSkillCheck(''),
        testSkillCheck('on win'),
      ];

      const sanitized = sanitizeDecision(attribs, body, 123, () => '', log);

      expect(sanitized.body).toEqual([]);
      expect(prettifyMsgs(log.finalize())).toContain('Invalid skill check: "light"');
      expect(prettifyMsgs(log.finalize())).toContain('Invalid skill check: "light interrupted"');
      expect(prettifyMsgs(log.finalize())).toContain('Invalid skill check: ""');
      expect(prettifyMsgs(log.finalize())).toContain('Invalid skill check: "on win"');
      expect(prettifyMsgs(log.finalize())).toContain('URL: 424');
    });
  });
});
