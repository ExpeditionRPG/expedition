import * as Redux from 'redux'
import {inflight} from './InFlight'
import {AppState, AppStateWithHistory} from './StateTypes'
import {InflightRejectAction, InflightCommitAction} from '../actions/ActionTypes'

const identity = (state: AppStateWithHistory, action: Redux.Action) => { return state; };
const increment = (state: AppStateWithHistory, action: Redux.Action) => { return {...state, user: {id: (state && state.user && state.user.id || '') + 'a'}}; };

const testAction = {type: 'TEST_ACTION', _inflight: 1} as Redux.Action;
const testAction2 = {type: 'TEST_ACTION2', _inflight: 2} as Redux.Action;

describe('InFlight reducer', () => {

  let stateWithInflight: AppStateWithHistory;
  beforeEach(() => {
    stateWithInflight = inflight(inflight({} as AppStateWithHistory, testAction, identity), testAction2, identity);
  });

  describe('on non-INFLIGHT message', () => {
    it('pushes new inflight actions onto the stack', () => {
      const state = {} as AppStateWithHistory;
      const newInflight = inflight(state, testAction, identity)._inflight;
      if (!newInflight) {
        throw new Error('inflight() returned undefined _inflight');
      }
      expect(newInflight[0]).toEqual(jasmine.objectContaining({action: testAction}));
    });
  });

  describe('on INFLIGHT_REJECT', () => {
    it('marks rejection but does not change state', () => {
      const newState = inflight(stateWithInflight, {type: 'INFLIGHT_REJECT', id: 2} as InflightRejectAction, increment);
      expect(newState._inflight).toContain(jasmine.objectContaining({action: testAction}));
      expect(newState._inflight).not.toContain(jasmine.objectContaining({action: testAction2}));
    });

    it('safely handles unknown inflight id', () => {
      // Does not throw error
      inflight(stateWithInflight, {type: 'INFLIGHT_REJECT', id: 50} as InflightRejectAction, increment);
    });

    it('rejects higher-valued uncommitted actions', () => {
      const newState = inflight(stateWithInflight, {type: 'INFLIGHT_REJECT', id: 1} as InflightRejectAction, increment);
      expect(newState._inflight).toEqual([]);
    });
  });

  describe('on INFLIGHT_COMMIT', () => {
    it('compacts fully-committed actions automatically', () => {
      const newState = inflight(inflight(
        stateWithInflight,
        {type: 'INFLIGHT_COMMIT', id: 1} as InflightCommitAction, increment),
        {type: 'INFLIGHT_COMMIT', id: 2} as InflightCommitAction, increment);
      expect(newState._inflight).toEqual([]);
      expect(newState.user).toBeUndefined();
    });

    it('handles out-of-order commits', () => {
      const newState = inflight(inflight(
        stateWithInflight,
        {type: 'INFLIGHT_COMMIT', id: 2} as InflightCommitAction, increment),
        {type: 'INFLIGHT_COMMIT', id: 1} as InflightCommitAction, increment);
      expect(newState._inflight).toEqual([]);
      expect(newState.user).toBeUndefined();
    });

    it('safely handles unknown inflight id', () => {
      // Does not throw error
      inflight(stateWithInflight, {type: 'INFLIGHT_COMMIT', id: 69} as InflightCommitAction, increment);
    });
  });

  describe('on INFLIGHT_COMPACT', () => {
    it('appends committed state from consecutive committed actions', () => {
      const newState = inflight(inflight(
        stateWithInflight,
        {type: 'INFLIGHT_COMMIT', id: 1} as InflightCommitAction, increment),
        {type: 'INFLIGHT_COMPACT'}, increment);

      // The new state should reflect the committed/compacted action.
      expect(newState).toEqual(jasmine.objectContaining({user: {id: 'a'}} as AppStateWithHistory));

      // All other inflight actions are discarded
      expect(newState._inflight).toEqual([]);
    });

    it('safely handles no inflight actions', () => {
      expect(inflight({} as AppStateWithHistory, {type: 'INFLIGHT_COMPACT'}, increment)).toBeDefined();
    });
  });
});
