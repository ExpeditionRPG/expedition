import {QuestMetadataChangeAction} from '../actions/ActionTypes';
import {quest} from './Quest';

describe('quest', () => {
  test.skip('returns initial state', () => { /* TODO */ });

  test('updates metadata state on change', () => {
    const change: QuestMetadataChangeAction = {type: 'QUEST_METADATA_CHANGE', key: 'author', value: 'test'};
    expect(quest({}, change)).toEqual({author: 'test'});
  });

  test.skip('handles load', () => { /* TODO */ });

  test.skip('clears on new', () => { /* TODO */ });

  test.skip('clears on delete', () => { /* TODO */ });

  test.skip('handles publish', () => { /* TODO */ });
});
