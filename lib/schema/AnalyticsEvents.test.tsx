import {AnalyticsEvent} from './AnalyticsEvents'

describe('AnalyticsEvent Schema', () => {
  const base = {userID: '54321'};
  it('is invalid when missing user id', () => {
    expect(AnalyticsEvent.create({}) instanceof Error).toEqual(true);
  });
  it('is valid when user id given', () => {
    const f = new AnalyticsEvent(base);
    expect(f.userID).toEqual(base.userID);
  });
  it('rejects invalid difficulty', () => {
    expect(AnalyticsEvent.create({...base, difficulty: 'Invalid'}) instanceof Error).toEqual(true);
  });
  it('accepts valid difficulty', () => {
    new AnalyticsEvent({...base, difficulty: 'HARD'});
  });
})
