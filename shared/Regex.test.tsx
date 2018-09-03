import {combinedRegex, REGEX} from './Regex';

describe('REGEX', () => {
  describe('combinedRegex', () => {
    test('combines regexes', () => {
      const combined = combinedRegex([/a/, /b/]);
      expect(combined.test('a')).toBe(true);
      expect(combined.test('b')).toBe(true);
      expect(combined.test('c')).toBe(false);
    });

    test('sets flags', () => {
      const combined = combinedRegex([/a/, /b/], 'g');
      expect(combined.test('a')).toBe(true);
      expect(combined.test('a')).toBe(false); // Second call is end-of-string
    });
  });
  describe('HTML tag', () => {
    test.skip('TODO', () => { /* TODO */ });
  });
  describe('INVALID_ART', () => {
    test('matches [art] on a line with other content', () => {
      expect(REGEX.INVALID_ART.test(' text[art_with_CAPS_and_Underscores_1234]')).toBe(true);
    });
    test('does not match [art] tags on their own lines', () => {
      expect(REGEX.INVALID_ART.test('   [art_with_CAPS_and_Underscores_1234]   ')).toBe(false);
    });
  });
  describe('ART', () => {
    test('matches [art] tags', () => {
      expect(REGEX.ART.test('[art_with_CAPS_and_Underscores_1234]')).toBe(true);
    });
    test('does not match non-art tags', () => {
      expect(REGEX.ART.test('[this is just a random bracket thing]')).toBe(false);
    });
  });
  describe('ICON', () => {
    test('matches :icon: tags', () => {
      expect(REGEX.ICON.test(':icon_with_CAPS_and_Underscores_1234:')).toBe(true);
    });
    test('does not match non-icon tags', () => {
      expect(REGEX.ICON.test(':this is just misuse of colons:')).toBe(false);
    });
  });
  describe('ID', () => {
    test('matches alphanumeric text', () => {
      expect(REGEX.ID.test('(#123teST)')).toBe(true);
      expect(REGEX.ID.test('(#teST123)')).toBe(true);
    });
    test('rejects text with whitespace and punctuation', () => {
      expect(REGEX.ID.test('(#test badid)')).toBe(false);
      expect(REGEX.ID.test('(#test.badid)')).toBe(false);
    });
    test('rejects id with empty string', () => {
      expect(REGEX.ID.test('(#)')).toBe(false);
    });
  });
  describe('Instruction', () => {
    test.skip('TODO', () => { /* TODO */ });
  });
  describe('Not Word', () => {
    test.skip('TODO', () => { /* TODO */ });
  });
  describe('Op', () => {
    test.skip('TODO', () => { /* TODO */ });
  });
  describe('Trigger', () => {
    test('matches gotos', () => {
      expect(REGEX.TRIGGER.test('**goto test123ABC**')).toBe(true);
    });
    test('matches end/win/lose', () => {
      expect(REGEX.TRIGGER.test('**win**')).toBe(true);
      expect(REGEX.TRIGGER.test('**lose**')).toBe(true);
      expect(REGEX.TRIGGER.test('**end**')).toBe(true);
    });
    test('matches with op at start', () => {
      expect(REGEX.TRIGGER.test('**{{condition = True}} goto test123ABC**')).toBe(true);
      expect(REGEX.TRIGGER.test('**{{condition = True}} win**')).toBe(true);
      expect(REGEX.TRIGGER.test('**{{condition = True}} end**')).toBe(true);
    });
    test('does not match other boldtext', () => {
      expect(REGEX.TRIGGER.test('**really this is more of just a bold sentence**')).toBe(false);
    });
    test('does not match goto with punctuation', () => {
      expect(REGEX.TRIGGER.test('**goto bad.triggername**')).toBe(false);
    });
  });
});
