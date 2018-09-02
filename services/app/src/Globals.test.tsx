import {getDevicePlatform, setDevice} from './Globals';

describe('Globals', () => {

  describe('getDevicePlatform', () => {
    // Disabled for now because of unexpected behavior with Phantom
    // it('reports web if no device inititialized', () => {
    //   // No initialization at all
    //   expect(getDevicePlatform()).toEqual('web');
    // });

    test('defaults to web on unexpected device', () => {
      setDevice({platform: 'zune'});
      expect(getDevicePlatform()).toEqual('web');
    });

    test('reports ios if ios device initialized', () => {
      setDevice({platform: 'ios'});
      expect(getDevicePlatform()).toEqual('ios');
    });

    test('reports android if android device initialized', () => {
      setDevice({platform: 'android'});
      expect(getDevicePlatform()).toEqual('android');
    });
  });
});
