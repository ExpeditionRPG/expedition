import {consumeErrors} from '../error'

export function errors(state = {}, action: any): any {
  // Transfer accumulated errors into state.
  return consumeErrors();
}
