import { combinedRegex, REGEX } from './Regex';

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
    test('matches opening tags, with and without attributes', () => {
      expect(REGEX.HTML_TAG.test('<b>')).toBe(true);
      expect(REGEX.HTML_TAG.test('<span class="highlight">')).toBe(true);
    });
    test('matches closing tags', () => {
      expect(REGEX.HTML_TAG.test('</b>')).toBe(true);
    });
    test('is case insensitive', () => {
      expect(REGEX.HTML_TAG.test('<DIV>')).toBe(true);
    });
    test('matches tags spanning newlines', () => {
      expect('<a\nhref="b">x</a>'.match(REGEX.HTML_TAG)![0]).toEqual(
        '<a\nhref="b">',
      );
    });
    test('matches lazily, one tag at a time', () => {
      // (.|\n)*? is lazy, so the match stops at the first '>' rather than
      // swallowing everything up to the last one on the line.
      expect('<b>bold</b>'.match(REGEX.HTML_TAG)![0]).toEqual('<b>');
    });
    test('does not match "<" that is not the start of a tag', () => {
      expect(REGEX.HTML_TAG.test('3 < 5, and 5 > 3')).toBe(false);
      expect(REGEX.HTML_TAG.test('<3 you')).toBe(false);
      expect(REGEX.HTML_TAG.test('< div>')).toBe(false);
    });
    test('strips all tags when applied globally (as sanitizeStyles does)', () => {
      const global = new RegExp(REGEX.HTML_TAG.source, 'g');
      expect('<b>hi</b> <i class="x">yo</i>'.replace(global, '')).toEqual(
        'hi yo',
      );
    });
  });
  describe('INVALID_ART', () => {
    test('matches [art] on a line with other content', () => {
      expect(
        REGEX.INVALID_ART.test(' text[art_with_CAPS_and_Underscores_1234]'),
      ).toBe(true);
    });
    test('does not match [art] tags on their own lines', () => {
      expect(
        REGEX.INVALID_ART.test('   [art_with_CAPS_and_Underscores_1234]   '),
      ).toBe(false);
    });
  });
  describe('ART', () => {
    test('matches [art] tags', () => {
      expect(REGEX.ART.test('[art_with_CAPS_and_Underscores_1234]')).toBe(true);
    });
    test('does not match non-art tags', () => {
      expect(REGEX.ART.test('[this is just a random bracket thing]')).toBe(
        false,
      );
    });
  });
  describe('ICON', () => {
    test('matches :icon: tags', () => {
      expect(REGEX.ICON.test(':icon_with_CAPS_and_Underscores_1234:')).toBe(
        true,
      );
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
    test('captures the text of a plain instruction', () => {
      const m = '> Roll a d20'.match(REGEX.INSTRUCTION);
      expect(m).not.toBeNull();
      expect(m![2]).toBeUndefined(); // no condition
      expect(m![3]).toEqual('Roll a d20');
    });
    test('captures both the condition and the text of a conditional instruction', () => {
      const m = '> {{hasSword}} Swing your sword'.match(REGEX.INSTRUCTION);
      expect(m).not.toBeNull();
      expect(m![2]).toEqual('hasSword');
      expect(m![3]).toEqual('Swing your sword');
    });
    test('captures the condition lazily, leaving later curlies in the text', () => {
      const m = '> {{a}} then {{b}}'.match(REGEX.INSTRUCTION);
      expect(m![2]).toEqual('a');
      expect(m![3]).toEqual('then {{b}}');
    });
    test('only matches at the start of the line', () => {
      expect(REGEX.INSTRUCTION.test('not an instruction')).toBe(false);
      expect(REGEX.INSTRUCTION.test('text > with an angle bracket')).toBe(
        false,
      );
    });
  });
  describe('Not Word', () => {
    test('matches characters that are not letters or apostrophes', () => {
      expect(REGEX.NOT_WORD.test('hello there')).toBe(true); // space
      expect(REGEX.NOT_WORD.test('abc123')).toBe(true); // digit
      expect(REGEX.NOT_WORD.test('hello!')).toBe(true); // punctuation
    });
    test('does not match letters or apostrophes', () => {
      expect(REGEX.NOT_WORD.test('hello')).toBe(false);
      expect(REGEX.NOT_WORD.test('MiXeDcAsE')).toBe(false);
      expect(REGEX.NOT_WORD.test("don't")).toBe(false);
    });
    test('strips everything but word characters when applied globally', () => {
      const global = new RegExp(REGEX.NOT_WORD.source, 'g');
      expect('Hello, world! 123'.replace(global, '')).toEqual('Helloworld');
    });
  });
  describe('Op', () => {
    test('matches a simple op', () => {
      expect('{{ gold }} Test'.match(REGEX.OP)![0]).toEqual('{{ gold }}');
    });
    test('matches the first op on a multi-op line', () => {
      expect('{{a}} and {{b}}'.match(REGEX.OP)![0]).toEqual('{{a}}');
    });
    test('matches an op on a later line', () => {
      expect('text\n{{ gold }}'.match(REGEX.OP)![0]).toEqual('{{ gold }}');
    });
    test('does not match an unclosed op', () => {
      expect(REGEX.OP.test('{{ gold }')).toBe(false);
      expect(REGEX.OP.test('no ops here')).toBe(false);
    });
    test('does not match ops containing curly braces', () => {
      // Known limitation of [^}]*: object literals inside an op defeat the match.
      // This is why Renderer.sanitizeStyles does bracket counting rather than
      // using this regex to extract ops.
      expect(REGEX.OP.test('{{ wallet = {gold: 0} }}')).toBe(false);
    });
  });
  describe('markdown styles', () => {
    test('NEWLINE matches an escaped newline, not a real one', () => {
      expect(REGEX.NEWLINE.test('line one\\nline two')).toBe(true);
      expect(REGEX.NEWLINE.test('line one\nline two')).toBe(false);
    });
    test('BOLD_ASTERISKS captures the text between **s', () => {
      expect('a **bold** b'.match(REGEX.BOLD_ASTERISKS)![1]).toEqual('bold');
      expect(REGEX.BOLD_ASTERISKS.test('*only italic*')).toBe(false);
    });
    test('BOLD_UNDERSCORES captures the text between __s', () => {
      expect('a __bold__ b'.match(REGEX.BOLD_UNDERSCORES)![1]).toEqual('bold');
      expect(REGEX.BOLD_UNDERSCORES.test('_only italic_')).toBe(false);
    });
    test('ITALIC_ASTERISKS captures the text between *s', () => {
      expect('a *italic* b'.match(REGEX.ITALIC_ASTERISKS)![1]).toEqual(
        'italic',
      );
    });
    test('ITALIC_ASTERISKS matches an empty capture inside bold text', () => {
      // Why sanitizeStyles must replace bold before italic: run against '**x**'
      // the italic regex matches the leading '**' with an empty group.
      expect('**bold**'.match(REGEX.ITALIC_ASTERISKS)![0]).toEqual('**');
      expect('**bold**'.match(REGEX.ITALIC_ASTERISKS)![1]).toEqual('');
    });
    test('ITALIC_UNDERSCORES captures the text between _s', () => {
      expect('a _italic_ b'.match(REGEX.ITALIC_UNDERSCORES)![1]).toEqual(
        'italic',
      );
    });
    test('STRIKETHROUGH captures the text between ~~s', () => {
      expect('a ~~struck~~ b'.match(REGEX.STRIKETHROUGH)![1]).toEqual('struck');
      expect(REGEX.STRIKETHROUGH.test('a ~single~ b')).toBe(false);
    });
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
      expect(
        REGEX.TRIGGER.test('**{{condition = True}} goto test123ABC**'),
      ).toBe(true);
      expect(REGEX.TRIGGER.test('**{{condition = True}} win**')).toBe(true);
      expect(REGEX.TRIGGER.test('**{{condition = True}} end**')).toBe(true);
    });
    test('does not match other boldtext', () => {
      expect(
        REGEX.TRIGGER.test('**really this is more of just a bold sentence**'),
      ).toBe(false);
    });
    test('does not match goto with punctuation', () => {
      expect(REGEX.TRIGGER.test('**goto bad.triggername**')).toBe(false);
    });
  });
});
