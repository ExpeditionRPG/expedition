import {formatPlayPeriod} from './Format';

describe('formatPlayPeriod', () => {
  it('formats time ranges to minutes and hours', () => {
    expect(formatPlayPeriod(30, 60)).toEqual('30-60 min');
    expect(formatPlayPeriod(30, 120)).toEqual('30-120 min');
    expect(formatPlayPeriod(60, 120)).toEqual('1-2 hrs');
    expect(formatPlayPeriod(999, 999)).toEqual('2+ hrs');
  });
});
