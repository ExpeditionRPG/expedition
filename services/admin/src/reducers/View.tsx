import {
  QueryErrorAction,
  SelectRowAction,
  SetViewAction,
  SetViewFeedbackAction,
  SetViewQuestsAction,
  SetViewUsersAction,
  UpdateFeedbackAction,
  UpdateQuestAction,
  UpdateUserAction,
} from '../actions/ActionTypes';
import { ViewState } from './StateTypes';

// Every table starts empty. This used to ship one hardcoded row per table --
// a "test quest" with id 129348, a "Test user" holding 5 loot points, and a
// piece of "Test feedback" -- which rendered indistinguishably from real
// production data until the first query happened to come back. An empty table
// is the honest state before a query has returned.
export const defaultView: ViewState = {
  feedback: [],
  filter: '',
  lastQueryError: null,
  quests: [],
  selected: { user: null, quest: null, feedback: null },
  users: [],
  view: 'FEEDBACK',
};

declare type ViewActions =
  | SetViewAction
  | SetViewFeedbackAction
  | SetViewQuestsAction
  | SetViewUsersAction
  | SelectRowAction
  | UpdateUserAction
  | UpdateQuestAction
  | UpdateFeedbackAction
  | QueryErrorAction;

export function view(
  state: ViewState = defaultView,
  action: ViewActions,
): ViewState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.view };
    case 'SET_VIEW_FEEDBACK':
      return { ...state, feedback: action.entries, lastQueryError: null };
    case 'SET_VIEW_QUESTS':
      return { ...state, quests: action.entries, lastQueryError: null };
    case 'SET_VIEW_USERS':
      return { ...state, users: action.entries, lastQueryError: null };
    case 'SELECT_ROW':
      return {
        ...state,
        selected: { ...state.selected, [action.table]: action.row },
      };
    case 'UPDATE_USER': {
      const users = [...state.users];
      for (let i = 0; i < users.length; i++) {
        if (users[i].id === action.m.userid) {
          users[i] = { ...users[i], loot_points: action.m.loot_points || 0 };
          break;
        }
      }
      return { ...state, users };
    }
    case 'UPDATE_QUEST': {
      const quests = [...state.quests];
      for (let i = 0; i < quests.length; i++) {
        if (
          quests[i].id === action.m.questid &&
          quests[i].partition === action.m.partition
        ) {
          quests[i] = { ...quests[i], published: action.m.published || false };
          break;
        }
      }
      return { ...state, quests };
    }
    case 'UPDATE_FEEDBACK': {
      const feedback = [...state.feedback];
      for (let i = 0; i < feedback.length; i++) {
        if (
          feedback[i].user.id === action.m.userid &&
          feedback[i].quest.id === action.m.questid &&
          feedback[i].partition === action.m.partition
        ) {
          feedback[i] = {
            ...feedback[i],
            suppressed: action.m.suppress || false,
          };
          break;
        }
      }
      return { ...state, feedback };
    }
    case 'QUERY_ERROR':
      return {
        ...state,
        lastQueryError: { view: action.view, error: action.error },
      };
    default:
      return state;
  }
}
