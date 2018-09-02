import {configure, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {FEATURED_QUESTS} from '../../Constants';
import {QuestDetails} from '../../reducers/QuestTypes';
import {initialSettings} from '../../reducers/Settings';
import QuestPreview, {Props} from './QuestPreview';
configure({ adapter: new Adapter() });

describe('QuestPreview', () => {
  function setup(questTitle: string, overrides?: Partial<Props>, questOverrides?: Partial<QuestDetails>) {
    const props: Props = {
      isDirectLinked: false,
      savedInstances: [],
      lastPlayed: null,
      quest: {...FEATURED_QUESTS.filter((el) => el.title === questTitle)[0], ...questOverrides},
      settings: initialSettings,
      onPlay: jasmine.createSpy('onPlay'),
      onPlaySaved: jasmine.createSpy('onPlaySaved'),
      onSave: jasmine.createSpy('onSave'),
      onDeleteOffline: jasmine.createSpy('onDeleteOffline'),
      onDeleteConfirm: jasmine.createSpy('onDeleteConfirm'),
      onReturn: jasmine.createSpy('onReturn'),
      ...overrides,
    };
    const wrapper = render(QuestPreview(props), undefined /*renderOptions*/);
    return {props, wrapper};
  }

  test('renders selected quest details', () => {
    const quest = FEATURED_QUESTS.filter((el) => el.title === 'Learning to Adventure')[0];
    const {wrapper} = setup(quest.title);
    expect(wrapper.html()).toContain(quest.title);
    expect(wrapper.html()).toContain(quest.genre);
    expect(wrapper.html()).toContain(quest.summary);
    expect(wrapper.html()).toContain(quest.author);
    expect(wrapper.html()).toContain(quest.official);
    expect(wrapper.html()).not.toContain(quest.expansionhorror);
    expect(wrapper.html()).not.toContain(quest.requirespenpaper);
    expect(wrapper.html()).not.toContain(quest.awarded);
  });

  test('shows last played information if it has been played before', () => {
    const quest = FEATURED_QUESTS.filter((el) => el.title === 'Learning to Adventure')[0];
    const {wrapper} = setup(quest.title, {lastPlayed: new Date()});
    expect(wrapper.text().toLowerCase()).toContain('last completed');
  });

  test('does not show last played infomation if it does not exist', () => {
    const quest = FEATURED_QUESTS.filter((el) => el.title === 'Learning to Adventure')[0];
    const {wrapper} = setup(quest.title, {lastPlayed: null});
    expect(wrapper.text().toLowerCase()).not.toContain('last completed');
  });

  test('does not show book icon if it does not exist', () => {
    const quest = FEATURED_QUESTS.filter((el) => el.title === 'Learning to Adventure')[0];
    const {wrapper} = setup(quest.title, {}, {requirespenpaper: false});
    expect(wrapper.html()).not.toContain('book');
  });

  test('shows a book icon if it exists', () => {
    const quest = FEATURED_QUESTS.filter((el) => el.title === 'Learning to Adventure')[0];
    const {wrapper} = setup(quest.title, {}, {requirespenpaper: true});
    expect(wrapper.html()).toContain('book');
  });

  test.skip('prompts for user count and multitouch if playing direct linked', () => { /* TODO */ });
  test.skip('goes directly to playing quest if not direct linked', () => { /* TODO */ });
  test.skip('allows users to go back', () => { /* TODO */ });
  test.skip('allows save for offline play', () => { /* TODO */ });
  test.skip('continues from most recent save', () => { /* TODO */ });
  test.skip('lists all saves for the quest', () => { /* TODO */ });
  test.skip('indicates when the quest is available offline', () => { /* TODO */ });
  test.skip('does not allow users to save local quests offline', () => { /* TODO */ });
});
