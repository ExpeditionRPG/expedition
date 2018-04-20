import * as React from 'react'
import {shallow, render} from 'enzyme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {formatPlayPeriod, renderResult, SearchSettingsCard, SearchSettingsCardProps, SearchResultProps} from './Search'
import {initialSearch} from '../reducers/Search'
import {loggedOutUser} from '../reducers/User'
import {initialSettings} from '../reducers/Settings'
import {SearchSettings} from '../reducers/StateTypes'
import {FEATURED_QUESTS, LanguageType} from '../Constants'

const renderOptions = {context: {muiTheme: getMuiTheme()}, childContextTypes: {muiTheme: React.PropTypes.object}};

const TEST_SEARCH: SearchSettings = {
  contentrating: 'Teen',
  text: 'Test Text',
  order: '+title',
  mintimeminutes: 30,
  maxtimeminutes: 60,
  age: 31536000,
  language: 'English' as LanguageType,
  genre: 'Comedy',
};

describe('Search', () => {
  it('formats time ranges to minutes and hours', () => {
    expect(formatPlayPeriod(30, 60)).toEqual('30-60 min');
    expect(formatPlayPeriod(30, 120)).toEqual('30-120 min');
    expect(formatPlayPeriod(60, 120)).toEqual('1-2 hrs');
  });

  describe('Settings', () => {
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
      const inst = wrapper.instance();
      expect(inst.state).toEqual(initialSearch.search);
      for (const k of Object.keys(TEST_SEARCH)) {
        wrapper.find('#'+k)
          .simulate('change', { target: { value: TEST_SEARCH[k] } }, TEST_SEARCH[k], TEST_SEARCH[k]);
      }

      wrapper.find('#search').simulate('touchTap');
      expect(props.onSearch).toHaveBeenCalledWith(TEST_SEARCH, jasmine.any(Object));
    });
  });

  describe('Result', () => {
    function setup(questTitle: string) {
      const props: SearchResultProps = {
        index: 0,
        quest: FEATURED_QUESTS.filter((el) => el.title === questTitle)[0],
        search: TEST_SEARCH,
        onQuest: jasmine.createSpy('onQuest'),
      };
      const wrapper = render(renderResult(props), renderOptions);
      return {props, wrapper};
    }

    it('displays no expansion icons when quest has no expansions', () => {
      const {props, wrapper} = setup('Learning to Adventure');
      expect(wrapper.html().indexOf('<span class="expansions"></span>') !== -1).toBe(true);
    });

    it('displays horror icon when a quest uses the Horror expansion', () => {
      const {props, wrapper} = setup('Learning 2: The Horror');
      expect(wrapper.html().indexOf('horror_small.svg') !== -1).toBe(true);
    });
  });

  describe('Results', () => {
    it('gracefully handles no search results');
    it('renders some search results');
  });

  describe('Details', () => {
    it('renders selected quest details');
  });
});
