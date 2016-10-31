import {CardState} from './StateTypes'
import {NavigateAction, ReturnAction} from '../actions/ActionTypes'

export function card(state: CardState = {name: 'SPLASH_CARD', ts: 0}, action: Redux.Action): CardState {
  switch (action.type) {
    case 'NAVIGATE':
      return (action as NavigateAction).to;
    default:
      return state;
  }
}