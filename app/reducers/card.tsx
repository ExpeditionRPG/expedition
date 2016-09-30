import {CardActionType} from './StateTypes'
import {NavigateAction} from '../actions/ActionTypes'
import {navigateTo} from '../actions/card'

const initial_state: CardActionType[] = [navigateTo({name: 'SPLASH_CARD', entry: 'INSTANT'}).to];

export function card(state: CardActionType[] = initial_state, action: Redux.Action): CardActionType[] {
  switch (action.type) {
    case 'NAVIGATE':
      var newState = Object.assign([], state);
      // TODO: Eventually limit the history so we don't OOM.
      newState.push((action as NavigateAction).to);
      return newState;
    case 'RETURN':
      var newState = Object.assign([], state);
      newState.pop();
      newState[newState.length-1].entry = 'PREV';
      console.log(newState);
      return newState;
    default:
      return state;
  }
}