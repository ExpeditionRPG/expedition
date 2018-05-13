import * as React from 'react'
import {shallow, render} from 'enzyme'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {
  formatPlayPeriod,
  renderDetails,
  renderResult,
  SearchDetailsProps,
  SearchSettingsCard,
  SearchSettingsCardProps,
  SearchResultProps
} from './Search'
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
    function setup(questTitle: string, overrides?: Partial<SearchResultProps>) {
      const props: SearchResultProps = {
        index: 0,
        lastPlayed: null,
        quest: FEATURED_QUESTS.filter((el) => el.title === questTitle)[0],
        search: TEST_SEARCH,
        onQuest: jasmine.createSpy('onQuest'),
        ...overrides,
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

    it('displayed last played date if quest has been played before', () => {
      const {props, wrapper} = setup('Learning to Adventure', {lastPlayed: new Date()});
      expect(wrapper.html().indexOf('questPlayedIcon') !== -1).toBe(true);
    });

    it('does not display last played date if quest has not been played', () => {
      const {props, wrapper} = setup('Learning to Adventure');
      expect(wrapper.html().indexOf('questPlayedIcon') === -1).toBe(true);
    });
  });

  describe('Results', () => {
    it('gracefully handles no search results');
    it('renders some search results');
  });

  describe('Details', () => {
    function setup(questTitle: string, overrides?: Partial<SearchDetailsProps>) {
      const props: SearchDetailsProps = {
        isDirectLinked: false,
        lastPlayed: null,
        quest: FEATURED_QUESTS.filter((el) => el.title === questTitle)[0],
        onPlay: jasmine.createSpy('onPlay'),
        onReturn: jasmine.createSpy('onReturn'),
        ...overrides,
      };
      const wrapper = render(renderDetails(props), renderOptions);
      return {props, wrapper};
    }

    it('renders selected quest details', () => {
      const quest = FEATURED_QUESTS.filter((el) => el.title === 'Learning to Adventure')[0];
      const {props, wrapper} = setup(quest.title);
      expect(wrapper.html().indexOf(quest.title) !== -1).toBe(true);
      expect(wrapper.html().indexOf(quest.genre as string) !== -1).toBe(true);
      expect(wrapper.html().indexOf(quest.summary) !== -1).toBe(true);
      expect(wrapper.html().indexOf(quest.author) !== -1).toBe(true);
    });

    it('shows last played information if it has been played before', () => {
      const quest = FEATURED_QUESTS.filter((el) => el.title === 'Learning to Adventure')[0];
      const {props, wrapper} = setup(quest.title, {lastPlayed: new Date()});
      expect(wrapper.html().toLowerCase().indexOf('last played') !== -1).toBe(true);
    });

    it('does not show last played infomation if it does not exist', () => {
      const quest = FEATURED_QUESTS.filter((el) => el.title === 'Learning to Adventure')[0];
      const {props, wrapper} = setup(quest.title, {lastPlayed: null});
      expect(wrapper.html().toLowerCase().indexOf('last played') !== -1).toBe(false);
    });

    it('prompts for user count and multitouch if playing direct linked');
    it('goes directly to playing quest if not direct linked');
    it('allows users to go back');
  });
});
