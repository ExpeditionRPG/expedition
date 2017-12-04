import * as Redux from 'redux'
import {inflight} from './InFlight'
import {AppState, AppStateWithHistory} from './StateTypes'
import {InflightRejectAction, InflightCommitAction} from '../actions/ActionTypes'

const identity = (state: AppStateWithHistory, action: Redux.Action) => { return state; };
const increment = (state: AppStateWithHistory, action: Redux.Action) => { return {...state, user: {id: (state && state.user && state.user.id || '') + 'a'}}; };

const testAction = {type: 'TEST_ACTION', _inflight: 'action1'} as Redux.Action;
const testAction2 = {type: 'TEST_ACTION2', _inflight: 'action2'} as Redux.Action;

fdescribe('InFlight reducer', () => {

  let stateWithInflight: AppStateWithHistory;
  beforeEach(() => {
    stateWithInflight = inflight(inflight({} as AppStateWithHistory, testAction, identity), testAction2, identity);
  });

  describe('on non-INFLIGHT message', () => {
    it('pushes new inflight actions onto the stack', () => {
      const state = {} as AppStateWithHistory;
      expect(inflight(state, testAction, identity)._inflight[0]).toEqual(jasmine.objectContaining({action: testAction}));
    });
  });

  describe('on INFLIGHT_REJECT', () => {
    it('marks rejection but does not change state', () => {
      const newState = inflight(stateWithInflight, {type: 'INFLIGHT_REJECT', id: 'action1'} as InflightRejectAction, increment);
      expect(newState._inflight).not.toContain(jasmine.objectContaining({action: testAction}));
      expect(newState._inflight).toContain(jasmine.objectContaining({action: testAction2}));
    });

    it('safely handles unknown inflight id', () => {
      // Does not throw error
      inflight(stateWithInflight, {type: 'INFLIGHT_REJECT', id: 'notarealid'} as InflightRejectAction, increment);
    });
  });

  describe('on INFLIGHT_COMMIT', () => {
    it('compacts fully-committed actions automatically', () => {
      const newState = inflight(inflight(
        stateWithInflight,
        {type: 'INFLIGHT_COMMIT', id: 'action1'} as InflightCommitAction, increment),
        {type: 'INFLIGHT_COMMIT', id: 'action2'} as InflightCommitAction, increment);
      expect(newState._inflight).toEqual([]);
      expect(newState.user).toBeUndefined();
    });

    it('handles out-of-order commits', () => {
      const newState = inflight(inflight(
        stateWithInflight,
        {type: 'INFLIGHT_COMMIT', id: 'action2'} as InflightCommitAction, increment),
        {type: 'INFLIGHT_COMMIT', id: 'action1'} as InflightCommitAction, increment);
      expect(newState._inflight).toEqual([]);
      expect(newState.user).toBeUndefined();
    });

    it('safely handles unknown inflight id', () => {
      // Does not throw error
      inflight(stateWithInflight, {type: 'INFLIGHT_COMMIT', id: 'notarealid'} as InflightCommitAction, increment);
    });
  });

  describe('on INFLIGHT_COMPACT', () => {
    it('appends committed state from consecutive committed actions', () => {
      const newState = inflight(inflight(
        stateWithInflight,
        {type: 'INFLIGHT_COMMIT', id: 'action1'} as InflightCommitAction, increment),
        {type: 'INFLIGHT_COMPACT'}, increment);
      expect(newState._committed).toEqual([{user: {id: 'a'}} as AppState]);

      // Action2 still in flight
      expect(newState._inflight[0]).toEqual(jasmine.objectContaining({action: testAction2}));
      expect(newState._inflight.length).toEqual(1);
    });

    it('safely handles no inflight actions', () => {
      expect(inflight({} as AppStateWithHistory, {type: 'INFLIGHT_COMPACT'}, increment)).toBeDefined();
    });
  });
});
