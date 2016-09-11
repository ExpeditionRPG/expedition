import {consumeErrors} from '../error'
import {ErrorsType} from './StateTypes'

export function errors(state: ErrorsType = [], action: Redux.Action): ErrorsType {
  // Transfer accumulated errors into state.
  return consumeErrors();
}
