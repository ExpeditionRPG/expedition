import Redux from 'redux'
import {consumeErrors} from '../error'
import {ErrorsState} from './StateTypes'

export function errors(state: ErrorsState = [], action: Redux.Action): ErrorsState {
  // Transfer accumulated errors into state.
  return consumeErrors();
}
