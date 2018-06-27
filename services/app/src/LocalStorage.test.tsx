import {
  getStorageBoolean,
  getStorageJson,
  getStorageNumber,
  getStorageString,
  setStorageKeyValue,
} from './LocalStorage'

// Note: setStorageKeyValue is tested as part of the other tests
describe('LocalStorage', () => {
  it('returns boolean from getStorageBoolean', () => {
    setStorageKeyValue('test_a', true);
    expect(getStorageBoolean('test_a', false)).toEqual(true);
  });
  it('returns JSON from getStorageJson', () => {
    const obj = {a: 1, b: false, c: 'test'};
    setStorageKeyValue('test_b', obj);
    expect(getStorageJson('test_b', {})).toEqual(obj);
  });
  it('returns number from getStorageNumber', () => {
    setStorageKeyValue('test_c', 54321);
    expect(getStorageNumber('test_c', 0)).toEqual(54321);
  });
  it('returns string from getStorageString', () => {
    setStorageKeyValue('test_d', 'a string');
    expect(getStorageString('test_d', '')).toEqual('a string');
  });
});
