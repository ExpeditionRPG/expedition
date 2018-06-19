import {REGEX, combinedRegex} from './Regex'

describe('REGEX', () => {
  describe('combinedRegex', () => {
    it('combines regexes', () => {
      const combined = combinedRegex([/a/, /b/]);
      expect(combined.test('a')).toBe(true);
      expect(combined.test('b')).toBe(true);
      expect(combined.test('c')).toBe(false);
    });

    it('sets flags', () => {
      const combined = combinedRegex([/a/, /b/], 'g');
      expect(combined.test('a')).toBe(true);
      expect(combined.test('a')).toBe(false); // Second call is end-of-string
    })
  });
  describe('HTML tag', () => {
    it('TODO');
  });
  describe('INVALID_ART', () => {
    it('matches [art] on a line with other content', () => {
      expect(REGEX.INVALID_ART.test(' text[art_with_CAPS_and_Underscores_1234]')).toBe(true);
    });
    it('does not match [art] tags on their own lines', () => {
      expect(REGEX.INVALID_ART.test('   [art_with_CAPS_and_Underscores_1234]   ')).toBe(false);
    });
  });
  describe('ART', () => {
    it('matches [art] tags', () => {
      expect(REGEX.ART.test('[art_with_CAPS_and_Underscores_1234]')).toBe(true);
    });
    it('does not match non-art tags', () => {
      expect(REGEX.ART.test('[this is just a random bracket thing]')).toBe(false);
    });
  });
  describe('ICON', () => {
    it('matches :icon: tags', () => {
      expect(REGEX.ICON.test(':icon_with_CAPS_and_Underscores_1234:')).toBe(true);
    });
    it('does not match non-icon tags', () => {
      expect(REGEX.ICON.test(':this is just misuse of colons:')).toBe(false);
    });
  });
  describe('ID', () => {
    it('matches alphanumeric text', () => {
      expect(REGEX.ID.test('(#123teST)')).toBe(true);
      expect(REGEX.ID.test('(#teST123)')).toBe(true);
    });
    it('rejects text with whitespace and punctuation', () => {
      expect(REGEX.ID.test('(#test badid)')).toBe(false);
      expect(REGEX.ID.test('(#test.badid)')).toBe(false);
    });
    it('rejects id with empty string', () => {
      expect(REGEX.ID.test('(#)')).toBe(false);
    });
  });
  describe('Instruction', () => {
    it('TODO');
  });
  describe('Not Word', () => {
    it('TODO');
  });
  describe('Op', () => {
    it('TODO');
  });
  describe('Trigger', () => {
    it('matches gotos', () => {
      expect(REGEX.TRIGGER.test('**goto test123ABC**')).toBe(true);
    });
    it('matches end/win/lose', () => {
      expect(REGEX.TRIGGER.test('**win**')).toBe(true);
      expect(REGEX.TRIGGER.test('**lose**')).toBe(true);
      expect(REGEX.TRIGGER.test('**end**')).toBe(true);
    });
    it('matches with op at start', () => {
      expect(REGEX.TRIGGER.test('**{{condition = True}} goto test123ABC**')).toBe(true);
      expect(REGEX.TRIGGER.test('**{{condition = True}} win**')).toBe(true);
      expect(REGEX.TRIGGER.test('**{{condition = True}} end**')).toBe(true);
    });
    it('does not match other boldtext', () => {
      expect(REGEX.TRIGGER.test('**really this is more of just a bold sentence**')).toBe(false);
    });
    it('does not match goto with punctuation', () => {
      expect(REGEX.TRIGGER.test('**goto bad.triggername**')).toBe(false);
    })
  });
});
