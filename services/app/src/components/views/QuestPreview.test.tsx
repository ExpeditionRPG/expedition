import * as React from 'react';
import {Quest} from 'shared/schema/Quests';
import {TUTORIAL_QUESTS} from '../../Constants';
import {initialSettings} from '../../reducers/Settings';
import QuestPreview, {Props} from './QuestPreview';
import {Partition} from 'shared/schema/Constants';
import {mount, unmountAll} from 'app/Testing';

describe('QuestPreview', () => {
  const savedInstances = [
    {pathLen: 1, ts: 1},
    {pathLen: 1, ts: 2},
    {pathLen: 1, ts: 4},
    {pathLen: 1, ts: 3},
  ];

  afterEach(() => {
    unmountAll();
  });

  function setupCustom(questTitle: string, overrides?: Partial<Props>, questOverrides?: Partial<Quest>) {
    const props: Props = {
      isDirectLinked: false,
      savedInstances: [],
      lastPlayed: null,
      lastLogin: new Date(),
      quest: new Quest({...TUTORIAL_QUESTS.filter((el) => el.title === questTitle)[0], ...questOverrides}),
      settings: {...initialSettings},
      onPlay: jasmine.createSpy('onPlay'),
      onPlaySaved: jasmine.createSpy('onPlaySaved'),
      onSave: jasmine.createSpy('onSave'),
      onDeleteOffline: jasmine.createSpy('onDeleteOffline'),
      onDeleteConfirm: jasmine.createSpy('onDeleteConfirm'),
      onReturn: jasmine.createSpy('onReturn'),
      ...overrides,
    };
    const wrapper = mount(<QuestPreview {...(props as any as Props)} />);
    return {props, wrapper};
  }
  function setup(overrides?: Partial<Props>, questOverrides?: Partial<Quest>) {
    return setupCustom('Learning to Adventure', overrides, questOverrides);
  }

  test('renders selected quest details', () => {
    const quest = TUTORIAL_QUESTS.filter((el) => el.title === 'Learning to Adventure')[0];
    const {wrapper} = setup(quest.title);
    expect(wrapper.render().html()).toContain(quest.title);
    expect(wrapper.render().html()).toContain(quest.genre);
    expect(wrapper.render().html()).toContain(quest.summary);
    expect(wrapper.render().html()).toContain(quest.author);
    expect(wrapper.render().html()).toContain('Official Quest');
    expect(wrapper.render().html()).not.toContain('The Horror');
    expect(wrapper.render().html()).not.toContain('The Future');
    expect(wrapper.render().html()).not.toContain('Pen and Paper');
    expect(wrapper.render().html()).not.toContain('Award');
  });

  test('shows last played information if it has been played before', () => {
    const {wrapper} = setup({lastPlayed: new Date()});
    expect(wrapper.render().text().toLowerCase()).toContain('last completed');
  });

  test('does not show last played infomation if it does not exist', () => {
    const {wrapper} = setup({lastPlayed: null});
    expect(wrapper.render().text().toLowerCase()).not.toContain('last completed');
  });

  test('does not show book icon if it does not exist', () => {
    const {wrapper} = setup({}, {requirespenpaper: false});
    expect(wrapper.render().html()).not.toContain('book');
  });

  test('shows a book icon if it exists', () => {
    const {wrapper} = setup({}, {requirespenpaper: true});
    expect(wrapper.render().html()).toContain('book');
  });

  test('passes direct-linked state so we can ask for count and multitouch', () => {
    const {props, wrapper} = setup({isDirectLinked: true});
    wrapper.find('ExpeditionButton#play').prop('onClick')();
    expect(props.onPlay).toHaveBeenCalledWith(props.quest, true);
  });

  test('allows users to go back to the search page', () => {
    const {props, wrapper} = setup();
    wrapper.find('ExpeditionButton#searchDetailsBackButton').prop('onClick')();
    expect(props.onReturn).toHaveBeenCalledTimes(1);
  });

  test('allows save for offline play', () => {
    const quest = new Quest({...TUTORIAL_QUESTS[0], publishedurl: 'http://somenonlocalurl'});
    const {props, wrapper} = setup({quest});
    wrapper.find('ExpeditionButton#offlinesave').prop('onClick')();
    expect(props.onSave).toHaveBeenCalledWith(quest);
  });

  test('continues from most recent save', () => {
    const {props, wrapper} = setup({savedInstances});
    wrapper.find('ExpeditionButton#playlastsave').prop('onClick')();
    expect(props.onPlaySaved).toHaveBeenCalledWith(props.quest.id, 4);
  });

  test('lists all saves for the quest', () => {
    const {props, wrapper} = setup({savedInstances});
    for (let i = 0; i < props.savedInstances.length; i++) {
      expect(wrapper.find('#playsave' + i).exists()).toEqual(true);
    }
  });

  test('indicates when the quest is available offline', () => {
    const {props, wrapper} = setup({savedInstances: [{pathLen: 0, ts: 1}]});
    expect(wrapper.find(".indicators").text()).toContain("Available Offline");
  });

  test('indicates when quest is new', () => {
    const {props, wrapper} = setup({quest: new Quest({...TUTORIAL_QUESTS[0], created: new Date()})});
    expect(wrapper.find(".indicators").text()).toContain("Published Recently");
  });

  test('indicates when quest is private', () => {
    const {props, wrapper} = setup({quest: new Quest({...TUTORIAL_QUESTS[0], partition: Partition.expeditionPrivate})});
    expect(wrapper.find(".indicators").text()).toContain("Private Quest");
  });

  test('indicates when quest is official', () => {
    const {props, wrapper} = setup({quest: new Quest({...TUTORIAL_QUESTS[0], official: true})});
    expect(wrapper.find(".indicators").text()).toContain("Official Quest");
  });

  test('disallows saving local quests for offline play', () => {
    const quest = new Quest({...TUTORIAL_QUESTS[0], publishedurl: 'quests/localquest.xml'});
    const {props, wrapper} = setup({quest});
    expect(wrapper.find('#offlinesave').exists()).toEqual(false);
  });

  test('asks user for confirmation when deleting a saved quest instance', () => {
    const {props, wrapper} = setup({savedInstances});
    wrapper.find('IconButton#deletesave1').prop('onClick')();
    // Saves are sorted in descending order of timestamp
    expect(props.onDeleteConfirm).toHaveBeenCalledWith(props.quest, props.savedInstances[3].ts);
  });

  test('indicates that horror and future expansions are required', () => {
    const quest = TUTORIAL_QUESTS.filter((el) => el.title === 'Learning 3: The Future')[0];
    const {wrapper} = setup({quest});
    expect(wrapper.html()).toContain('horror');
    expect(wrapper.html()).toContain('future');
  });
});
