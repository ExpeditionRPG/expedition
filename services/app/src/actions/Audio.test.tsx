describe('Audio', () => {
  // Entirely glue code
  // + loadAudioLocalFile, which is entirely calls to external functions
  // and mocking them all would remove everything that's worth testing
  test('Empty', () => { /* TODO */ });
});


//test.skip('handles loading errors', () => { /* TODO */ });

//  test.skip('clears loading state when loaded', () => { /* TODO */ });

//  test.skip('aborts loading if disabled mid-load', () => { /* TODO */ });

/*
const loadAudio = (context: AudioContext, url: string, callback: (err: Error|null, buffer: NodeSet|null) => void) => {
    const s = fakeAudioNode();
    ns[url] = s;
    callback(null, s);
  };
  */
