import {Reducer} from '../Testing';
import {multiplayer} from './Multiplayer';

describe('Multiplayer reducer', () => {
  test('stops syncing when new non-multi-event committed', () => {
    Reducer(multiplayer).withState({syncing: true, multiEvent: false})
      .expect({type: 'MULTIPLAYER_COMMIT'})
      .toChangeState({syncing: false});
  });
});
