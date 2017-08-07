import {initial_state} from '../reducers/Settings'
import {mapDispatchToProps} from './ToolsContainer'
import configureStore  from 'redux-mock-store'
import thunk from 'redux-thunk'

const mockStore = configureStore([thunk]);

describe('ToolsContainer', () => {
  it('dispatches custom combat on callback', () => {
    const store = mockStore({});
    mapDispatchToProps(store.dispatch, null).onCustomCombatSelect(initial_state);
    // TODO: Simplify/remove.
    expect(store.getActions()[0]).toEqual(jasmine.objectContaining({
      type: 'NAVIGATE',
      to: jasmine.objectContaining({name:'QUEST_CARD', phase: 'DRAW_ENEMIES'}),
    }));
  });
});
