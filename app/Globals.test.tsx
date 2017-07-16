import {setDevice, getDevicePlatform, getAppVersion} from './Globals'

describe('Globals', () => {

  describe('getDevicePlatform', () => {
    it('reports web if no device inititialized', () => {
      // No initialization at all
      expect(getDevicePlatform()).toEqual('web');
    });

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
});
