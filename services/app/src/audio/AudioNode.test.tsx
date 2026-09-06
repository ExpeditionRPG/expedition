import { AudioNode } from './AudioNode';

function fakeSource(playing: bool = false) {
  return {
    PLAYING_STATE: true,
    buffer: null,
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    playbackState: playing,
  };
}

function fakeGain(value: number = 0) {
  return {
    connect: jest.fn(),
    disconnect: jest.fn(),
    gain: {
      setValueAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn(),
      value,
    },
  };
}

function fakeContext(now?: number) {
  return {
    createGain: jest.fn(),
    createBufferSource: jest.fn(),
    destination: 'fakedest',
    currentTime: now || 0,
  };
}

function fakeBuffer() {
  return null;
}

describe('AudioNode', () => {
  describe('playOnce', () => {
    const g = fakeGain();
    const s = fakeSource();
    const c = fakeContext();
    c.createGain.mockReturnValue(g);
    c.createBufferSource.mockReturnValue(s);
    const n = new AudioNode(c, fakeBuffer());
    n.playOnce(0.5, 0.7);

    test('starts the source node', () => {
      expect(s.start).toHaveBeenCalledTimes(1);
    });

    test('transitively connects the source to the destination', () => {
      let node: any = s;
      for (
        let i = 0;
        i < 100 && node !== c.destination && node && node.connect;
        i++
      ) {
        node = node.connect.mock.lastCall[0];
      }
      expect(node).toEqual(c.destination);
    });

    test('sets initial and final volume', () => {
      expect(g.gain.setValueAtTime.mock.lastCall[0]).toEqual(0.5);
      expect(g.gain.linearRampToValueAtTime.mock.lastCall[0]).toEqual(0.7);
    });
  });

  describe('isPlaying', () => {
    test('false when node not started', () => {
      expect(new AudioNode(fakeContext(), fakeBuffer()).isPlaying()).toEqual(
        false,
      );
    });
    test('true when playing audio', () => {
      const g = fakeGain();
      const s = fakeSource(true);
      const c = fakeContext();
      c.createGain.mockReturnValue(g);
      c.createBufferSource.mockReturnValue(s);
      const n = new AudioNode(c, fakeBuffer());
      n.playOnce();
      expect(n.isPlaying()).toEqual(true);
    });
  });

  describe('getVolume', () => {
    test('returns null when gain not set', () => {
      expect(new AudioNode(fakeContext(), fakeBuffer()).getVolume()).toEqual(
        null,
      );
    });

    test('gets volume when gain set', () => {
      const g = fakeGain(0.5);
      const s = fakeSource(true);
      const c = fakeContext();
      c.createGain.mockReturnValue(g);
      c.createBufferSource.mockReturnValue(s);
      const n = new AudioNode(c, fakeBuffer());
      n.playOnce();
      expect(n.getVolume()).toEqual(0.5);
    });
  });
});
