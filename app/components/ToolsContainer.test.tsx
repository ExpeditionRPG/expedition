import {initialSettings} from '../reducers/Settings'
import {mapDispatchToProps} from './ToolsContainer'
import configureStore  from 'redux-mock-store'
import {RemotePlayClient} from '../RemotePlay'

describe('ToolsContainer', () => {
  let client: any;
  let mockStore: any;
  beforeEach(() => {
    client = new RemotePlayClient();
    mockStore = (initialState: any) => {return configureStore([client.createActionMiddleware()])(initialState)};
  });

  it('dispatches custom combat on callback', () => {
    const store = mockStore({});
    mapDispatchToProps(store.dispatch, null).onCustomCombatSelect(initialSettings);
    // TODO: Simplify/remove.
    expect(store.getActions()[0]).toEqual(jasmine.objectContaining({
      type: 'NAVIGATE',
      to: jasmine.objectContaining({name:'QUEST_CARD', phase: 'DRAW_ENEMIES'}),
    }));
  });
});
