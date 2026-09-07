import { load } from './Cheerio';

// These assertions pin the parse/serialize behaviour that quest XML depends on.
// Every one of them was verified against cheerio 0.22 before the upgrade; if a
// future cheerio changes one, published quests change with it.
describe('Cheerio', () => {
  test('parses with htmlparser2, not parse5 (no html/head/body wrapper)', () => {
    expect(load('<quest title="x"><roleplay/></quest>').html()).toEqual(
      '<quest title="x"><roleplay></roleplay></quest>',
    );
  });

  test('serializes empty attributes with an explicit empty value', () => {
    expect(String(load('<roleplay title=""></roleplay>')('roleplay'))).toEqual(
      '<roleplay title=""></roleplay>',
    );
  });

  test('serializes empty elements with a closing tag, not self-closed', () => {
    expect(String(load('<quest><p></p></quest>')('quest'))).toEqual(
      '<quest><p></p></quest>',
    );
  });

  test('re-encodes apostrophes and quotes as XML entities', () => {
    const $ = load(
      `<quest title="GM's &quot;Corner&quot;"><p>it's</p></quest>`,
    );
    expect(String($('quest'))).toEqual(
      '<quest title="GM&apos;s &quot;Corner&quot;"><p>it&apos;s</p></quest>',
    );
  });

  test('decodes entities when reading text', () => {
    expect(load('<p>a &amp; b &apos;c&apos;</p>')('p').text()).toEqual(
      "a & b 'c'",
    );
  });

  // The one serialization difference from cheerio 0.22 that could not be
  // preserved: `entities` now writes hexadecimal character references in
  // lowercase (it used to write `&#x261E;`). Both forms are the same character
  // in XML and HTML, and the decoded text is unchanged, which is what this
  // asserts alongside the new spelling.
  test('writes hexadecimal character references in lowercase', () => {
    const $ = load('<p>&#x261E;</p>');
    expect(String($('p'))).toEqual('<p>&#x261e;</p>');
    expect($('p').text()).toEqual('☞');
  });

  test('keeps unknown quest tags nested as authored', () => {
    const $ = load(
      '<quest><roleplay><p>a</p><choice text="c"><trigger>end</trigger></choice></roleplay></quest>',
    );
    expect($('quest > roleplay > choice > trigger').text()).toEqual('end');
  });
});
