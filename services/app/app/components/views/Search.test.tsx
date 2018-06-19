import {
  formatPlayPeriod,
  renderDetails,
  renderResult,
  SearchDetailsProps,
  SearchResultProps,
  smartTruncateSummary,
} from './Search'
import {SearchSettings} from '../../reducers/StateTypes'
import {QuestDetails} from '../../reducers/QuestTypes'
import {FEATURED_QUESTS} from '../../Constants'
import {LanguageType} from '@expedition-qdl/schema/Constants'
import {configure, render} from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
configure({ adapter: new Adapter() });

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
    /*
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

      wrapper.find('#search').simulate('click');
      expect(props.onSearch).toHaveBeenCalledWith(TEST_SEARCH, jasmine.any(Object));
    });
    */
  });

  describe('Result', () => {
    function setup(questTitle: string, overrides?: Partial<SearchResultProps>, questOverrides?: Partial<QuestDetails>) {
      const props: SearchResultProps = {
        index: 0,
        lastPlayed: null,
        quest: {...FEATURED_QUESTS.filter((el) => el.title === questTitle)[0], ...questOverrides},
        search: TEST_SEARCH,
        onQuest: jasmine.createSpy('onQuest'),
        ...overrides,
      };
      const wrapper = render(renderResult(props), undefined /*renderOptions*/);
      return {props, wrapper};
    }

    it('displays no expansion icons when quest has no expansions', () => {
      const {props, wrapper} = setup('Learning to Adventure');
      expect(wrapper.html()).not.toContain('horror');
    });

    it('displays horror icon when a quest uses the Horror expansion', () => {
      const {props, wrapper} = setup('Learning 2: The Horror');
      expect(wrapper.html()).toContain('horror');
    });

    it('does not display last played date if quest has not been played', () => {
      const {props, wrapper} = setup('Learning to Adventure');
      expect(wrapper.html()).not.toContain('questPlayedIcon');
    });

    it('displayed last played date if quest has been played before', () => {
      const {props, wrapper} = setup('Learning to Adventure', {lastPlayed: new Date()});
      expect(wrapper.html()).toContain('questPlayedIcon');
    });

    it('does not display awarded icon when quest not awarded', () => {
      const {props, wrapper} = setup('Learning to Adventure');
      expect(wrapper.html()).not.toContain('questAwardedIcon');
    });

    it('displays awarded icon if quest has received award', () => {
      const {props, wrapper} = setup('Learning to Adventure', {}, {awarded: 'The Bob Medal For Questing Mediocrity'});
      expect(wrapper.html()).toContain('questAwardedIcon');
    });

    it('does not display official icon if quest is not official', () => {
      const {props, wrapper} = setup('Learning to Adventure', {}, {official: false});
      expect(wrapper.html()).not.toContain('questOfficialIcon');
    });

    it('displays official icon if quest is official', () => {
      const {props, wrapper} = setup('Learning to Adventure');
      expect(wrapper.html()).toContain('questOfficialIcon');
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
      const wrapper = render(renderDetails(props), undefined /*renderOptions*/);
      return {props, wrapper};
    }

    it('renders selected quest details', () => {
      const quest = FEATURED_QUESTS.filter((el) => el.title === 'Learning to Adventure')[0];
      const {props, wrapper} = setup(quest.title);
      expect(wrapper.html()).toContain(quest.title);
      expect(wrapper.html()).toContain(quest.genre);
      expect(wrapper.html()).toContain(quest.summary);
      expect(wrapper.html()).toContain(quest.author);
    });

    it('shows last played information if it has been played before', () => {
      const quest = FEATURED_QUESTS.filter((el) => el.title === 'Learning to Adventure')[0];
      const {props, wrapper} = setup(quest.title, {lastPlayed: new Date()});
      expect(wrapper.text().toLowerCase()).toContain('last played');
    });

    it('does not show last played infomation if it does not exist', () => {
      const quest = FEATURED_QUESTS.filter((el) => el.title === 'Learning to Adventure')[0];
      const {props, wrapper} = setup(quest.title, {lastPlayed: null});
      expect(wrapper.text().toLowerCase()).not.toContain('last played');
    });

    it('prompts for user count and multitouch if playing direct linked');
    it('goes directly to playing quest if not direct linked');
    it('allows users to go back');
  });

  describe('smartTruncateSummary', () => {
    it('chains smaller sentences before stopping', () => {
      const DEAD_WASTELAND_SUMMARY = 'A story influenced by the awesome game Dead of Winter: Your colony is attacked. How will you respond? Actions have consequences, and consequences are far reaching. Will you survive The Dead of Winter?';
      const DEAD_WASTELAND_EXPECTED = 'A story influenced by the awesome game Dead of Winter: Your colony is attacked. How will you respond?';
      expect(smartTruncateSummary(DEAD_WASTELAND_SUMMARY)).toEqual(DEAD_WASTELAND_EXPECTED);
    });


    it('adds ellipses at a sentence boundary for a more natural feel', () => {
      const SHARDS_OF_TIME_SUMMARY = 'You wake-up in the middle of an Ash Barren wasteland of Aikania. Now you have to explore the lands but dark creatures are tormenting this land. Can you free Aikania from this horrible curse?';
      const SHARDS_OF_TIME_EXPECTED = 'You wake-up in the middle of an Ash Barren wasteland of Aikania...';
      expect(smartTruncateSummary(SHARDS_OF_TIME_SUMMARY)).toEqual(SHARDS_OF_TIME_EXPECTED);
    });

    it('leaves excessively-long sentences alone', () => {
      const MUNROE_SUMMARY = 'This kid-friendly, spooky Halloween adventure takes you into Mr Monroe’s haunted mansion where unexplainable things are happening…';
      expect(smartTruncateSummary(MUNROE_SUMMARY)).toEqual(MUNROE_SUMMARY);
    });
  });
});
