import {configure, render} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import {LanguageType} from 'shared/schema/Constants';
import {FEATURED_QUESTS} from '../../Constants';
import {QuestDetails} from '../../reducers/QuestTypes';
import {SearchSettings} from '../../reducers/StateTypes';
import QuestPreview, {QuestPreviewProps} from './QuestPreview';
configure({ adapter: new Adapter() });

describe('Details', () => {
  function setup(questTitle: string, overrides?: Partial<QuestPreviewProps>, questOverrides?: Partial<QuestDetails>) {
    const props: QuestPreviewProps = {
      isDirectLinked: false,
      lastPlayed: null,
      quest: {...FEATURED_QUESTS.filter((el) => el.title === questTitle)[0], ...questOverrides},
      onPlay: jasmine.createSpy('onPlay'),
      onPlaySaved: jasmine.createSpy('onPlaySaved'),
      onDeleteConfirm: jasmine.createSpy('onDeleteConfirm'),
      onReturn: jasmine.createSpy('onReturn'),
      savedTS: null,
      ...overrides,
    };
    const wrapper = render(QuestPreview(props), undefined /*renderOptions*/);
    return {props, wrapper};
  }

  it('renders selected quest details', () => {
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

  it('shows last played information if it has been played before', () => {
    const quest = FEATURED_QUESTS.filter((el) => el.title === 'Learning to Adventure')[0];
    const {wrapper} = setup(quest.title, {lastPlayed: new Date()});
    expect(wrapper.text().toLowerCase()).toContain('last played');
  });

  it('does not show last played infomation if it does not exist', () => {
    const quest = FEATURED_QUESTS.filter((el) => el.title === 'Learning to Adventure')[0];
    const {wrapper} = setup(quest.title, {lastPlayed: null});
    expect(wrapper.text().toLowerCase()).not.toContain('last played');
  });

  it('does not show book icon if it does not exist', () => {
    const quest = FEATURED_QUESTS.filter((el) => el.title === 'Learning to Adventure')[0];
    const {wrapper} = setup(quest.title, {}, {requirespenpaper: false});
    expect(wrapper.html()).not.toContain('book');
  });

  it('shows a book icon if it exists', () => {
    const quest = FEATURED_QUESTS.filter((el) => el.title === 'Learning to Adventure')[0];
    const {wrapper} = setup(quest.title, {}, {requirespenpaper: true});
    expect(wrapper.html()).toContain('book');
  });

  it('prompts for user count and multitouch if playing direct linked');
  it('goes directly to playing quest if not direct linked');
  it('allows users to go back');
});
