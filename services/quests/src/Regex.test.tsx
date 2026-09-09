import regex from './Regex';
test.each([
  ['EXTRACT_REGEX', '/hello/gi', ['/hello/gi', 'hello']],
  ['HTML_TAG', 'a <b title="x">bold</b>', ['<b title="x">', '</b>']],
  ['ID', 'go (#forest) now', ['(#forest)']],
  [
    'INSTRUCTION',
    '> {{alive}} Gain 2 health',
    ['> {{alive}} Gain 2 health', '{{alive}}', 'alive', 'Gain 2 health'],
  ],
  ['NOT_WORD', "don't, 12", [',', ' ', '1', '2']],
  ['OP', 'hello {{a = 1}} there {{b}}', ['{{a = 1}}', '{{b}}']],
  [
    'TRIGGER',
    '**{{alive}} goto ending**',
    [
      '**{{alive}} goto ending**',
      '{{alive}}',
      'alive',
      'goto ending',
      undefined,
      'goto ending',
    ],
  ],
])('%s extracts QDL syntax', (name, input, matches) => {
  expect(Array.from(input.match(regex[name]) || [])).toEqual(matches);
});
test('does not treat prose comparisons or invalid jumps as markup', () => {
  expect('1 < 2 > 0'.match(regex.HTML_TAG)).toBeNull();
  expect('**start**'.match(regex.TRIGGER)).toBeNull();
  expect('text without op'.match(regex.OP)).toBeNull();
});
