import {consumeErrors} from '../error'

export function errors(state = {}, action) {
  // Transfer accumulated errors into state.
  return consumeErrors();
}
