import {UNSUPPORTED_BROWSERS} from './Constants';

describe('Constants', () => {
  test('Properly identifies unsupported browsers', () => {
    expect(UNSUPPORTED_BROWSERS.test('Amazon silk')).toEqual(true);
    expect(UNSUPPORTED_BROWSERS.test('Chrome')).toEqual(false);
  });
});
