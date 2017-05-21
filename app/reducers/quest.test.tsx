import {quest} from './quest'
import {QuestMetadataChangeAction} from '../actions/ActionTypes'

describe('quest', () => {
  it('returns initial state')

  it('updates metadata state on change', () => {
    expect(quest({}, {type: 'QUEST_METADATA_CHANGE', key: 'author', value: 'test'} as QuestMetadataChangeAction)).toEqual({author: 'test'});
  });

  it('handles load')

  it('clears on new')

  it('clears on delete')

  it('handles publish')
})
