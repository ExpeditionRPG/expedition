describe('Audio', () => {
  // Spy on loadAudioLocalFile
  it('loads audio on init if enabled');

  it('does not load audio if disabled');

  it('loads audio if disabled on init -> enabled');

  it('adds more audio layers when intensity increases');

  it('mutes audio layers when intensity decreases');

  it('stages new loops before current loops expire');

  it('changes to high intensity loops when intensity passes threshold');

  it('handles loading errors');

  it('clears loading state when loaded');

  it('aborts loading if disabled mid-load');

  it('can be disabled while playing');

  it('can be paused while playing');

  it('can be resumed from a pause where it was playing');

  it('keeps track of intensity even while disabled');

  it('starts playing on disabled -> intensity change -> enabled -> load complete');
});
