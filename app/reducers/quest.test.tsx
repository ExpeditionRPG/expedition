import {quest} from './Quest'
import {QuestMetadataChangeAction} from '../actions/ActionTypes'

describe('quest', () => {
  it('returns initial state')

  it('updates metadata state on change', () => {
    const change: QuestMetadataChangeAction = {type: 'QUEST_METADATA_CHANGE', key: 'author', value: 'test'};
    expect(quest({}, change)).toEqual({author: 'test'});
  });

  it('handles load')

  it('clears on new')

  it('clears on delete')

  it('handles publish')
})
