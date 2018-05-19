import {setDevice, getDevicePlatform, getAppVersion, getDevice} from './Globals'

describe('Globals', () => {

  describe('getDevicePlatform', () => {
    // Disabled for now because of unexpected behavior with Phantom
    // it('reports web if no device inititialized', () => {
    //   // No initialization at all
    //   expect(getDevicePlatform()).toEqual('web');
    // });

    it('defaults to web on unexpected device', () => {
      setDevice({platform: 'zune'});
      expect(getDevicePlatform()).toEqual('web');
    });

    it('reports ios if ios device initialized', () => {
      setDevice({platform: 'ios'});
      expect(getDevicePlatform()).toEqual('ios');
    });

    it('reports android if android device initialized', () => {
      setDevice({platform: 'android'});
      expect(getDevicePlatform()).toEqual('android');
    });
  });

  describe('getAppVersion', () => {
    it('gets a version string', () => {
      expect(getAppVersion()).toMatch(/[0-9]+\.[0-9]+\.[0-9]+/);
    });
  });

  describe('getStorageKey', () => {
    it('returns boolean from storage');
    it('returns JSON from storage');
    it('returns number from storage');
    it('returns string from storage');
  });
  describe('setStorageKey', () => {
    it('converts booleans to strings');
    it('converts JSON to strings');
    it('converts numbers to strings');
    it('converts objects to strings');
  });
});
