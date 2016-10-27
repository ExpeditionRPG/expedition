import {SetDrawerAction} from '../actions/ActionTypes'
import {DrawerState} from './StateTypes'

const initial_state: DrawerState = {open: false};

export function drawer(state: DrawerState = initial_state, action: Redux.Action): DrawerState {
  switch (action.type) {
    case 'SET_DRAWER':
      let drawer_action = (action as SetDrawerAction);
      return {
        open: drawer_action.is_open,
      };
    case 'NEW_QUEST':
    case 'REQUEST_QUEST_LOAD':
    case 'REQUEST_QUEST_SAVE':
    case 'REQUEST_QUEST_PUBLISH':
    case 'REQUEST_QUEST_UNPUBLISH':
      return Object.assign({}, state, {open: false});
    default:
      return state;
  }
}
