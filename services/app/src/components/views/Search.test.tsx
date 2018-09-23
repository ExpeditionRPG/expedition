import {configure, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {LanguageType} from 'shared/schema/Constants';
import {Quest} from 'shared/schema/Quests';
import {FEATURED_QUESTS} from '../../Constants';
import {SearchSettings} from '../../reducers/StateTypes';
import {
  renderResult,
  SearchResultProps,
} from './Search';
configure({ adapter: new Adapter() });

const TEST_SEARCH: SearchSettings = {
  age: 31536000,
  contentrating: 'Teen',
  genre: 'Comedy',
  language: 'English' as LanguageType,
  maxtimeminutes: 60,
  mintimeminutes: 30,
  order: '+title',
  text: 'Test Text',
};

describe('Search', () => {
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

    test('propagates user selections when Search is pressed', () => {
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

    test('propagates user selections when form is submitted', () => {
      const {props, wrapper} = setup();
      const inst = wrapper.instance();
      expect(inst.state).toEqual(initialSearch.search);
      for (const k of Object.keys(TEST_SEARCH)) {
        wrapper.find('#'+k)
          .simulate('change', { target: { value: TEST_SEARCH[k] } }, TEST_SEARCH[k], TEST_SEARCH[k]);
      }

      wrapper.find('input').first().simulate('keypress', {key: 'Enter'});
      expect(props.onSearch).toHaveBeenCalledWith(TEST_SEARCH, jasmine.any(Object));
    });
    */
  });

  describe('Result', () => {
    function setup(questTitle: string, overrides?: Partial<SearchResultProps>, questOverrides?: Partial<Quest>) {
      const props: SearchResultProps = {
        index: 0,
        lastPlayed: null,
        offlineQuests: {},
        onQuest: jasmine.createSpy('onQuest'),
        quest: new Quest({...FEATURED_QUESTS.filter((el) => el.title === questTitle)[0], ...questOverrides}),
        search: TEST_SEARCH,
        ...overrides,
      };
      const wrapper = render(renderResult(props), undefined /*renderOptions*/);
      return {props, wrapper};
    }

    test('displays no expansion icons when quest has no expansions', () => {
      const {wrapper} = setup('Learning to Adventure');
      expect(wrapper.html()).not.toContain('horror');
    });

    test.skip('displays offline icon when quest is available offline', () => { /* TODO */ });

    test('displays horror icon when a quest uses the Horror expansion', () => {
      const {wrapper} = setup('Learning 2: The Horror');
      expect(wrapper.html()).toContain('horror');
    });

    test('displays no book icon when a quest does not require pen and paper', () => {
      const {wrapper} = setup('Learning to Adventure', {}, {requirespenpaper: false});
      expect(wrapper.html()).not.toContain('book');
    });

    test('displays NEW if quest created since last login', () => {
      const {wrapper} = setup('Learning to Adventure', {lastLogin: new Date('2010-01-01')});
      expect(wrapper.html()).toContain('NEW');
    });

    test('does not display NEW if quest created before last login', () => {
      const {wrapper} = setup('Learning to Adventure', {lastLogin: new Date('2020-01-01')});
      expect(wrapper.html()).not.toContain('NEW');
    });

    test('does not display last played date if quest has not been played', () => {
      const {wrapper} = setup('Learning to Adventure');
      expect(wrapper.html()).not.toContain('questPlayedIcon');
    });

    test('displayed last played date if quest has been played before', () => {
      const {wrapper} = setup('Learning to Adventure', {lastPlayed: new Date()});
      expect(wrapper.html()).toContain('questPlayedIcon');
    });

    test('does not display awarded icon when quest not awarded', () => {
      const {wrapper} = setup('Learning to Adventure');
      expect(wrapper.html()).not.toContain('questAwardedIcon');
    });

    test('displays awarded icon if quest has received award', () => {
      const {wrapper} = setup('Learning to Adventure', {}, {awarded: 'The Bob Medal For Questing Mediocrity'});
      expect(wrapper.html()).toContain('questAwardedIcon');
    });

    test('does not display official icon if quest is not official', () => {
      const {wrapper} = setup('Learning to Adventure', {}, {official: false});
      expect(wrapper.html()).not.toContain('questOfficialIcon');
    });

    test('displays official icon if quest is official', () => {
      const {wrapper} = setup('Learning to Adventure');
      expect(wrapper.html()).toContain('questOfficialIcon');
    });
  });

  describe('Results', () => {
    test.skip('gracefully handles no search results', () => { /* TODO */ });
    test.skip('renders some search results', () => { /* TODO */ });
    test.skip('shows spinner when loading results', () => { /* TODO */ });
  });
});
