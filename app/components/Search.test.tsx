import * as React from 'react'
import {shallow} from 'enzyme'
import {formatPlayPeriod, truncateSummary, SearchSettingsCard, SearchSettingsCardProps} from './Search'
import {initialSearch} from '../reducers/Search'
import {loggedOutUser} from '../reducers/User'
import {initialSettings} from '../reducers/Settings'
import {SearchSettings} from '../reducers/StateTypes'

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

describe('SearchSettingsCard', () => {
  function setup() {
    const props: SearchSettingsCardProps = {
      user: loggedOutUser,
      settings: initialSettings,
      search: initialSearch.search,
      onSearch: jasmine.createSpy('onSearch'),
    };
    const wrapper = shallow(<SearchSettingsCard {...props} />);
    return {props, wrapper};
  }

  it('propagates user selections when Search is pressed', () => {
    const {props, wrapper} = setup();
    const expected: any = {
      contentrating: 'Teen',
      text: 'Test Text',
      order: '+title',
      mintimeminutes: 30,
      maxtimeminutes: 60,
      age: 31536000,
      language: 'English',
      genre: 'Comedy',
    };

    const inst = wrapper.instance();
    expect(inst.state).toEqual(initialSearch.search);
    for (const k of Object.keys(expected)) {
      wrapper.find('#'+k)
        .simulate('change', { target: { value: expected[k] } }, expected[k], expected[k]);
    }

    wrapper.find('#search').simulate('touchTap');
    expect(props.onSearch).toHaveBeenCalledWith(expected, jasmine.any(Object));
  });
});
