import {getDevicePlatform, setDeviceForTest} from './Globals';

describe('Globals', () => {

  describe('getDevicePlatform', () => {
    // Disabled for now because of unexpected behavior with Phantom
    test('reports web if no device inititialized', () => {
      // No initialization at all
      expect(getDevicePlatform()).toEqual('web');
    });

    test('defaults to web on unexpected device', () => {
      setDeviceForTest({platform: 'zune'});
      expect(getDevicePlatform()).toEqual('web');
    });

    test('reports ios if ios device initialized', () => {
      setDeviceForTest({platform: 'ios'});
      expect(getDevicePlatform()).toEqual('ios');
    });

    test('reports android if android device initialized', () => {
      setDeviceForTest({platform: 'android'});
      expect(getDevicePlatform()).toEqual('android');
    });
  });
});
