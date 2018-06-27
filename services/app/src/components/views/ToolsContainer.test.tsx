import {initialSettings} from '../../reducers/Settings'
import {mapDispatchToProps} from './ToolsContainer'
import {newMockStore} from '../../Testing'

describe('ToolsContainer', () => {
  it('dispatches custom combat on callback', () => {
    const store = newMockStore({settings: initialSettings});
    mapDispatchToProps(store.dispatch, null).onCustomCombatSelect(initialSettings);
    // TODO: Simplify/remove.
    expect(store.getActions()[2]).toEqual(jasmine.objectContaining({
      type: 'NAVIGATE',
      to: jasmine.objectContaining({name:'QUEST_CARD', phase: 'DRAW_ENEMIES'}),
    }));
  });
});
