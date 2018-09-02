import {formatPlayPeriod, smartTruncateSummary} from './Format';

describe('formatPlayPeriod', () => {
  test('formats time ranges to minutes and hours', () => {
    expect(formatPlayPeriod(30, 60)).toEqual('30-60 min');
    expect(formatPlayPeriod(30, 120)).toEqual('30-120 min');
    expect(formatPlayPeriod(60, 120)).toEqual('1-2 hrs');
    expect(formatPlayPeriod(999, 999)).toEqual('2+ hrs');
  });
});

describe('smartTruncateSummary', () => {
  test('chains smaller sentences before stopping', () => {
    const DEAD_WASTELAND_SUMMARY = 'A story influenced by the awesome game Dead of Winter: Your colony is attacked. How will you respond? Actions have consequences, and consequences are far reaching. Will you survive The Dead of Winter?';
    const DEAD_WASTELAND_EXPECTED = 'A story influenced by the awesome game Dead of Winter: Your colony is attacked. How will you respond?';
    expect(smartTruncateSummary(DEAD_WASTELAND_SUMMARY)).toEqual(DEAD_WASTELAND_EXPECTED);
  });

  test('adds ellipses at a sentence boundary for a more natural feel', () => {
    const SHARDS_OF_TIME_SUMMARY = 'You wake-up in the middle of an Ash Barren wasteland of Aikania. Now you have to explore the lands but dark creatures are tormenting this land. Can you free Aikania from this horrible curse?';
    const SHARDS_OF_TIME_EXPECTED = 'You wake-up in the middle of an Ash Barren wasteland of Aikania...';
    expect(smartTruncateSummary(SHARDS_OF_TIME_SUMMARY)).toEqual(SHARDS_OF_TIME_EXPECTED);
  });

  test('leaves excessively-long sentences alone', () => {
    const MUNROE_SUMMARY = 'This kid-friendly, spooky Halloween adventure takes you into Mr Monroe’s haunted mansion where unexplainable things are happening…';
    expect(smartTruncateSummary(MUNROE_SUMMARY)).toEqual(MUNROE_SUMMARY);
  });
});
