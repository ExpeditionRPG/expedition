import {RECEIVE_QUEST_LIST, ReceiveQuestListAction, SET_DRAWER, SetDrawerAction, NEW_QUEST, REQUEST_QUEST_LOAD, REQUEST_QUEST_SAVE, REQUEST_QUEST_DELETE, REQUEST_QUEST_PUBLISH} from '../actions/ActionTypes'
import {DrawerType} from './StateTypes'

const initial_state: DrawerType = {open: false, quests: null, receivedAt: null};

export function drawer(state: DrawerType = initial_state, action: Redux.Action): DrawerType {
  switch (action.type) {
    case SET_DRAWER:
      let drawer_action = (action as SetDrawerAction);
      return {
        open: drawer_action.is_open,
        quests: state.quests
      };
    case RECEIVE_QUEST_LIST:
      let list_action = (action as ReceiveQuestListAction);
      return {
        open: state.open,
        quests: list_action.quests,
        receivedAt: list_action.receivedAt
      };
    case NEW_QUEST:
    case REQUEST_QUEST_LOAD:
    case REQUEST_QUEST_SAVE:
    case REQUEST_QUEST_DELETE:
    case REQUEST_QUEST_PUBLISH:
      return Object.assign({}, state, {open: false});
    default:
      return state;
  }
}