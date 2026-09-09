import { newMockStore } from '../Testing';
import { selectPlayedQuest, userQuestsDelta } from './QuestHistory';

test('dispatches quest history changes without dropping existing details', () => {
  const store = newMockStore({});
  const selected = {
    details: { id: 'quest-id' },
    lastPlayed: new Date(123),
  } as any;
  store.dispatch(userQuestsDelta({ 'quest-id': selected }));
  store.dispatch(selectPlayedQuest(selected));
  expect(store.getActions()).toEqual([
    { type: 'USER_QUESTS_DELTA', delta: { 'quest-id': selected } },
    { type: 'USER_QUEST_INSTANCE_SELECT', selected },
  ]);
});
