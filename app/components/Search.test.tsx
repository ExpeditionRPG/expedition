import * as React from 'react'
import {formatPlayPeriod, truncateSummary} from './Search'

describe('Search', () => {
  it('truncates too-long summaries', () => {
    const summary = 'The Baron of Threshold has was ambushed by the undead, but the party has a chance to change that.  Can they stop the forces of undeath and save the day?';
    const truncated = 'The Baron of Threshold has was ambushed by the undead, but the party has a chance to change that.  Can they stop the forces of undeath an...';
    expect(truncateSummary(summary)).toEqual(truncated);
  });

  it('formats time ranges to minutes and hours', () => {
    expect(formatPlayPeriod(30, 60)).toEqual('30-60 min');
    expect(formatPlayPeriod(30, 120)).toEqual('30-120 min');
    expect(formatPlayPeriod(60, 120)).toEqual('1-2 hrs');
  });

  it('gracefully handles no search results');
  it('renders some search results');
  it('renders selected quest details');
});
