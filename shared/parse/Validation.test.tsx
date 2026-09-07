import { isEmptyObject, validate } from './Validation';

import * as cheerio from '../Cheerio';

const load = (xml: string): any => cheerio.load(xml)('quest');

describe('Validation', () => {
  describe('isEmptyObject', () => {
    test('is true for an empty object', () => {
      expect(isEmptyObject({})).toBe(true);
    });
    test('is false for an object with keys', () => {
      expect(isEmptyObject({ a: 1 })).toBe(false);
    });
  });

  test('reports quest missing root <quest> node', () => {
    expect(() => validate(undefined as any)).toThrowError(
      'Quest has invalid root node',
    );
  });

  test('accepts a well-formed quest', () => {
    expect(() =>
      validate(
        load(
          '<quest title="t">' +
            '<roleplay id="start"><p>hi</p><choice text="go"><roleplay id="next"></roleplay></choice></roleplay>' +
            '<combat><e>Skeleton</e><event on="win"><trigger>end</trigger></event></combat>' +
            '</quest>',
        ),
      ),
    ).not.toThrow();
  });

  test('reports quest with elements outside the whitelist', () => {
    expect(() =>
      validate(
        load('<quest><roleplay><script>alert(1)</script></roleplay></quest>'),
      ),
    ).toThrowError(/Found invalid nodes and attributes.*script/);
  });

  test('counts each occurrence of an invalid element', () => {
    // Exercises the recursive merge of child results.
    let err: Error | null = null;
    try {
      validate(
        load(
          '<quest><script></script><roleplay><script></script></roleplay></quest>',
        ),
      );
    } catch (e) {
      err = e as Error;
    }
    expect(err).not.toBeNull();
    expect(
      JSON.parse(
        err!.message.replace('Found invalid nodes and attributes: ', ''),
      ),
    ).toEqual({ script: 2 });
  });

  test('reports quest with duplicate ids', () => {
    let err: Error | null = null;
    try {
      validate(
        load(
          '<quest><roleplay id="dupe"></roleplay><combat id="dupe"></combat></quest>',
        ),
      );
    } catch (e) {
      err = e as Error;
    }
    expect(err).not.toBeNull();
    expect(err!.message).toContain('Found nodes with duplicate ids');
    expect(
      JSON.parse(err!.message.replace('Found nodes with duplicate ids: ', '')),
    ).toEqual({ dupe: ['roleplay', 'combat'] });
  });

  test('allows unique ids', () => {
    expect(() =>
      validate(
        load(
          '<quest><roleplay id="a"></roleplay><roleplay id="b"></roleplay></quest>',
        ),
      ),
    ).not.toThrow();
  });

  test('reports quest with elements that have non-whitelisted attributes', () => {
    // Any attribute beginning with "on" is an HTML event handler, and is a
    // script-injection vector.
    expect(() =>
      validate(load('<quest><div onclick="alert(1)"></div></quest>')),
    ).toThrowError(/Found invalid nodes and attributes.*div\.onclick/);
  });

  test('allows the bare "on" attribute used by combat events', () => {
    expect(() =>
      validate(
        load('<quest><combat><event on="win"></event></combat></quest>'),
      ),
    ).not.toThrow();
  });
});
