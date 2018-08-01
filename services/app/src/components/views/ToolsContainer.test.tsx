import {initialSettings} from '../../reducers/Settings';
import {newMockStore} from '../../Testing';
import {mapDispatchToProps} from './ToolsContainer';

describe('ToolsContainer', () => {
  it('dispatches custom combat on callback', () => {
    const store = newMockStore({settings: initialSettings});
    mapDispatchToProps(store.dispatch).onCustomCombatSelect(initialSettings);
    // TODO: Simplify/remove.
    expect(store.getActions()[2]).toEqual(jasmine.objectContaining({
      to: jasmine.objectContaining({name: 'QUEST_CARD', phase: 'DRAW_ENEMIES'}),
      type: 'NAVIGATE',
    }));
  });
});
