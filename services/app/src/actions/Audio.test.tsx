import { getAudioContext } from '../Globals';
jest.mock('../Globals', () => ({
  ...jest.requireActual('../Globals'),
  getAudioContext: jest.fn(),
}));
import { AudioNode } from '../audio/AudioNode';
import { getAllMusicFiles, loadAudioFiles } from './Audio';

function setup() {
  const requests: any[] = [];
  const decodeAudioData = jest.fn((_data, success) => success({}));

  (getAudioContext as jest.Mock).mockReturnValue({ decodeAudioData });
  jest.spyOn(global, 'XMLHttpRequest').mockImplementation(() => {
    const request = {
      open: jest.fn(),
      send: jest.fn(),
      response: new ArrayBuffer(1),
      onload: null,
      onerror: null,
    };
    requests.push(request);
    return request as any;
  });
  const dispatch = jest.fn();
  loadAudioFiles()(dispatch);
  return {
    requests,
    dispatch,
    decodeAudioData,
    restore: () => {
      (getAudioContext as jest.Mock).mockReset();
    },
  };
}
test('handles loading errors and stops queuing more files', () => {
  const { requests, dispatch, restore } = setup();
  try {
    expect(requests).toHaveLength(4);
    requests[0].onerror();
    expect(dispatch).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: 'AUDIO_SET',
        delta: expect.objectContaining({ loaded: 'ERROR' }),
      }),
    );
    expect(requests).toHaveLength(4);
  } finally {
    restore();
  }
});
test('clears loading state and stores decoded tracks on completion', () => {
  const { requests, dispatch, restore } = setup();
  try {
    for (let i = 0; i < requests.length; i++) {
      requests[i].onload();
    }
    expect(requests).toHaveLength(getAllMusicFiles().length);
    expect(dispatch.mock.calls[0][0].delta.loaded).toBe('LOADING');
    expect(dispatch.mock.calls[1][0].delta.loaded).toBe('LOADED');
    const data = dispatch.mock.calls[2][0].data;
    expect(Object.keys(data.audioNodes)).toEqual(getAllMusicFiles());
    expect(
      Object.values(data.audioNodes).every(node => node instanceof AudioNode),
    ).toBe(true);
    expect(data.themeManager.isPaused()).toBe(false);
  } finally {
    restore();
  }
});
// Loading is a reusable cache operation; disabling is handled by Audio's
// playback lifecycle. Decoding must never start any playback on its own.
test('finishes an in-flight cache load without starting playback', () => {
  const { requests, restore } = setup();
  const play = jest.spyOn(AudioNode.prototype, 'playOnce');
  try {
    for (let i = 0; i < requests.length; i++) {
      requests[i].onload();
    }
    expect(play).not.toHaveBeenCalled();
  } finally {
    restore();
  }
});
