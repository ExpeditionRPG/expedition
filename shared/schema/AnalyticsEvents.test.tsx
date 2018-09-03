import {AnalyticsEvent} from './AnalyticsEvents';

describe('AnalyticsEvent Schema', () => {
  const base = {userID: '54321'};
  test('is invalid when missing user id', () => {
    expect(AnalyticsEvent.create({}) instanceof Error).toEqual(true);
  });
  test('is valid when user id given', () => {
    const f = new AnalyticsEvent(base);
    expect(f.userID).toEqual(base.userID);
  });
  test('rejects invalid difficulty', () => {
    expect(AnalyticsEvent.create({...base, difficulty: 'Invalid'}) instanceof Error).toEqual(true);
  });
  test('accepts valid difficulty', () => {
    const f = new AnalyticsEvent({...base, difficulty: 'HARD'});
    expect(f.difficulty).toEqual('HARD');
  });
});
