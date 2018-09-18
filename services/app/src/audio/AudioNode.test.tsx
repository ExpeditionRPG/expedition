
function fakeContext(now?: number) {
  return {
    createGain: jasmine.createSpy('createGain'),
    createBufferSource: jasmine.createSpy('createBufferSource'),
    destination: null,
    currentTime: now || 0,
  };
}

function fakeBuffer() {
  return null;
}

describe('AudioNode', () => {
  test.skip('TODO', () => { /* TODO */ });

  describe('isPlaying', () => {
    test('false when node not started', () => {
      expect(new AudioNode(fakeContext(), fakeBuffer()).isPlaying()).toEqual(false);
    });
  });

  describe('getVolume', () => {

  });
});
