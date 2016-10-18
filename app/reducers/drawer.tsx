import {ReceiveQuestListAction, SetDrawerAction} from '../actions/ActionTypes'
import {DrawerState} from './StateTypes'

const initial_state: DrawerState = {open: false, quests: null, receivedAt: null};

export function drawer(state: DrawerState = initial_state, action: Redux.Action): DrawerState {
  switch (action.type) {
    case 'SET_DRAWER':
      let drawer_action = (action as SetDrawerAction);
      return {
        open: drawer_action.is_open,
        quests: state.quests
      };
    case 'RECEIVE_QUEST_LIST':
      let list_action = (action as ReceiveQuestListAction);
      return {
        open: state.open,
        quests: list_action.quests,
        receivedAt: list_action.receivedAt
      };
    case 'NEW_QUEST':
    case 'REQUEST_QUEST_LOAD':
    case 'REQUEST_QUEST_SAVE':
    case 'REQUEST_QUEST_DELETE':
      return Object.assign({}, state, {open: false});
    default:
      return state;
  }
}