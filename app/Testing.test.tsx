import * as Redux from 'redux'
import {Reducer, Action} from './Testing'
import {remoteify} from './actions/ActionTypes'

function testReducer<A extends Redux.Action>(a: {b: number}, action: A) {
  if (action.type !== 'TEST_ACTION') {
    return a;
  }
  return {b: (action as any).b};
}

describe('Test Environment', () => {
  describe('Reducer', () => {
    it('supports general execution', () => {
      const result = Reducer(testReducer).withState({}).execute({type: 'TEST_ACTION', b: 5} as Redux.Action);
      expect(result).toEqual({b: 5});
    });
    it('supports expect.toReturnState', () => {
      Reducer(testReducer).withState({}).expect({type: 'TEST_ACTION', b: 7} as Redux.Action).toReturnState({b: 7});
    });
    it('supports expect.toStayTheSame', () => {
      Reducer(testReducer).withState({}).expect({type: 'RANDOM_ACTION'}).toStayTheSame();
    });
    it('supports expect.toChangeState', () => {
      Reducer(testReducer).withState({a: 10}).expect({type: 'TEST_ACTION', b: 9} as Redux.Action).toChangeState({b: 9});
    })
  });

  describe('Action', () => {
    it('supports general execution', () => {
      const result = Action(remoteify((a: {b: number}, dispatch: Redux.Dispatch<any>) => {
        dispatch({type: 'ACTION1'});
        dispatch({type: 'ACTION2'});
      })).execute({b: 5});
      expect(result).toEqual([{type: 'ACTION1'}, {type: 'ACTION2'}]);
    });
    it('supports expect.toSendMultiplayer', () => {
      const action = remoteify((a: {b: number}, dispatch: Redux.Dispatch<any>) => {
        dispatch({type: 'ACTION1'});
        dispatch({type: 'ACTION2'});
        return {b: 1};
      });
      Action(action).expect({b: 5}).toSendMultiplayer();
      Action(action).expect({b: 5}).toSendMultiplayer({b: 1});
    });
    it('supports expect.toNotSendMultiplayer', () => {
      Action(remoteify((a: {b: number}, dispatch: Redux.Dispatch<any>) => {return null;})).expect({b: 5}).toNotSendMultiplayer();
      Action(remoteify((a: {b: number}, dispatch: Redux.Dispatch<any>) => {return {b: 5};})).expect({b: 5}).toNotSendMultiplayer({b: 1});
    });
    it('supports expect.toDispatch', () => {
      Action(remoteify((a: {b: number}, dispatch: Redux.Dispatch<any>) => {
        dispatch({type: 'ACTION1'});
        dispatch({type: 'ACTION2'});
      })).expect({b: 5}).toDispatch({type: 'ACTION2'});
    });
  });
});
