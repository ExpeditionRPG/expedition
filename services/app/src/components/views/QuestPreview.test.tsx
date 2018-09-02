import {configure, render} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import {Quest} from 'shared/schema/Quests';
import {FEATURED_QUESTS} from '../../Constants';
import {initialSettings} from '../../reducers/Settings';
import QuestPreview, {Props} from './QuestPreview';
configure({ adapter: new Adapter() });

describe('QuestPreview', () => {
  function setup(questTitle: string, overrides?: Partial<Props>, questOverrides?: Partial<Quest>) {
    const props: Props = {
      isDirectLinked: false,
      savedInstances: [],
      lastPlayed: null,
      quest: new Quest({...FEATURED_QUESTS.filter((el) => el.title === questTitle)[0], ...questOverrides}),
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

  it('renders selected quest details', () => {
    const quest = FEATURED_QUESTS.filter((el) => el.title === 'Learning to Adventure')[0];
    const {wrapper} = setup(quest.title);
    expect(wrapper.html()).toContain(quest.title);
    expect(wrapper.html()).toContain(quest.genre);
    expect(wrapper.html()).toContain(quest.summary);
    expect(wrapper.html()).toContain(quest.author);
    expect(wrapper.html()).toContain('Official Quest');
    expect(wrapper.html()).not.toContain('The Horror');
    expect(wrapper.html()).not.toContain('The Future');
    expect(wrapper.html()).not.toContain('Pen and Paper');
    expect(wrapper.html()).not.toContain('Award');
  });

  it('shows last played information if it has been played before', () => {
    const {wrapper} = setup('Learning to Adventure', {lastPlayed: new Date()});
    expect(wrapper.text().toLowerCase()).toContain('last completed');
  });

  it('does not show last played infomation if it does not exist', () => {
    const {wrapper} = setup('Learning to Adventure', {lastPlayed: null});
    expect(wrapper.text().toLowerCase()).not.toContain('last completed');
  });

  it('does not show book icon if it does not exist', () => {
    const {wrapper} = setup('Learning to Adventure', {}, {requirespenpaper: false});
    expect(wrapper.html()).not.toContain('book');
  });

  it('shows a book icon if it exists', () => {
    const {wrapper} = setup('Learning to Adventure', {}, {requirespenpaper: true});
    expect(wrapper.html()).toContain('book');
  });

  /* TODO uncomment once Future learning quest out of dev
  it('indicates that horror and future expansions are required', () => {
    const quest = FEATURED_QUESTS.filter((el) => el.title === 'Learning 3: The Future')[0];
    const {wrapper} = setup(quest.title, {});
    expect(wrapper.html()).toContain('horror');
    expect(wrapper.html()).toContain('future');
  });
  */

  it('prompts for user count and multitouch if playing direct linked');
  it('goes directly to playing quest if not direct linked');
  it('allows users to go back');
  it('allows save for offline play');
  it('continues from most recent save');
  it('lists all saves for the quest');
  it('indicates when the quest is available offline');
  it('does not allow users to save local quests offline');
});
