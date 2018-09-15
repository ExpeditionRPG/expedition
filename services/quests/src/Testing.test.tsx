import * as Redux from 'redux';
import {Action, Reducer} from './Testing';

function testReducer<A extends Redux.Action>(a: {b: number}, action: A) {
  if (action.type !== 'TEST_ACTION') {
    return a;
  }
  return {b: (action as any).b};
}

describe('Test Environment', () => {
  describe('Reducer', () => {
    test('supports general execution', () => {
      const result = Reducer(testReducer).withState({}).execute({type: 'TEST_ACTION', b: 5} as Redux.Action);
      expect(result).toEqual({b: 5});
    });
    test('supports expect.toReturnState', () => {
      Reducer(testReducer).withState({}).expect({type: 'TEST_ACTION', b: 7} as Redux.Action).toReturnState({b: 7});
    });
    test('supports expect.toStayTheSame', () => {
      Reducer(testReducer).withState({}).expect({type: 'RANDOM_ACTION'}).toStayTheSame();
    });
    test('supports expect.toChangeState', () => {
      Reducer(testReducer).withState({a: 10}).expect({type: 'TEST_ACTION', b: 9} as Redux.Action).toChangeState({b: 9});
    });
  });

  // describe('Action', () => {
  //   test('supports general execution', () => {
  //     const result = Action((a: {b: number}, dispatch: Redux.Dispatch<any>) => {
  //       dispatch({type: 'ACTION1'});
  //       dispatch({type: 'ACTION2'});
  //     }).execute({b: 5});
  //     expect(result).toEqual([{type: 'ACTION1'}, {type: 'ACTION2'}]);
  //   });
  //   test('supports expect.toDispatch', () => {
  //     Action((a: {b: number}, dispatch: Redux.Dispatch<any>) => {
  //       dispatch({type: 'ACTION1'});
  //       dispatch({type: 'ACTION2'});
  //     }).expect({b: 5}).toDispatch({type: 'ACTION2'});
  //   });
  // });
});
