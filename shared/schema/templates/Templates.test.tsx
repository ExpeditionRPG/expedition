import {
  getTemplateType,
  TEMPLATE_ATTRIBUTE_MAP,
  TEMPLATE_ATTRIBUTE_SHORTHAND,
  TEMPLATE_TYPES,
} from './Templates';
describe('template registry', () => {
  test.each(TEMPLATE_TYPES)('recognizes the %s header', type => {
    expect(getTemplateType(type)).toBe(type);
  });
  test.each(['Combat', 'custom title', '', 'combat extra'])(
    'does not mistake %p for a special template',
    header => {
      expect(getTemplateType(header)).toBeNull();
    },
  );
  test('maps combat enemies to XML shorthand while narrative templates use body text', () => {
    expect(TEMPLATE_ATTRIBUTE_SHORTHAND[TEMPLATE_ATTRIBUTE_MAP.combat!]).toBe(
      'e',
    );
    expect(TEMPLATE_ATTRIBUTE_MAP.roleplay).toBeNull();
    expect(TEMPLATE_ATTRIBUTE_MAP.decision).toBeNull();
  });
});
