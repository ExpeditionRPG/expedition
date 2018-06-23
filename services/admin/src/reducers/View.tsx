import {
  SetViewAction,
  SetViewFeedbackAction,
  SetViewQuestsAction,
  SetViewUsersAction,
  SelectRowAction,
  UpdateUserAction,
  UpdateQuestAction,
  UpdateFeedbackAction,
  QueryErrorAction
} from '../actions/ActionTypes'
import {ViewState} from './StateTypes'

export const defaultView: ViewState = {
  view: 'FEEDBACK',
  filter: '',
  feedback: [{partition: 'expedition-public', quest: {id: '129348', title: 'test quest'}, user: {id: '12345', email: 'asdf@ghkjl.com'}, rating: 5, text: 'Test feedback', suppressed: false}],
  users: [{id: '12345', email: 'asdf@ghjkl.com', name: 'Test user', loot_points: 5, last_login: new Date()}],
  quests: [{id: '129348', title: 'test quest', partition: 'expedition-public', ratingavg: 3.5, ratingcount: 10, user: {id: '12345', email: 'author@test.com'}, published: true}],
  selected: {user: null, quest: null, feedback: null},
  lastQueryError: null,
};

declare type ViewActions = SetViewAction|SetViewFeedbackAction|SetViewQuestsAction|SetViewUsersAction|SelectRowAction|UpdateUserAction|UpdateQuestAction|UpdateFeedbackAction|QueryErrorAction;

export function view(state: ViewState = defaultView, action: ViewActions): ViewState {
  switch(action.type) {
    case 'SET_VIEW':
      return {...state, view: action.view};
    case 'SET_VIEW_FEEDBACK':
      return {...state, feedback: action.entries, lastQueryError: null};
    case 'SET_VIEW_QUESTS':
      return {...state, quests: action.entries, lastQueryError: null};
    case 'SET_VIEW_USERS':
      return {...state, users: action.entries, lastQueryError: null};
    case 'SELECT_ROW':
      return {...state, selected: {...state.selected, [action.table]: action.row}};
    case 'UPDATE_USER':
      const users = [...state.users];
      for (let i = 0; i < users.length; i++) {
        if (users[i].id === action.m.userid) {
          users[i] = {...users[i], loot_points: (action.m.loot_points || 0)};
          break;
        }
      }
      return {...state, users};
    case 'UPDATE_QUEST':
      const quests = [...state.quests];
      for (let i = 0; i < quests.length; i++) {
        if (quests[i].id === action.m.questid && quests[i].partition === action.m.partition) {
          quests[i] = {...quests[i], published: (action.m.published || false)};
          break;
        }
      }
      return {...state, quests};
    case 'UPDATE_FEEDBACK':
      const feedback = [...state.feedback];
      for (let i = 0; i < feedback.length; i++) {
        if (feedback[i].user.id === action.m.userid && feedback[i].quest.id === action.m.questid && feedback[i].partition === action.m.partition) {
          feedback[i] = {...feedback[i], suppressed: (action.m.suppress || false)};
          break;
        }
      }
      return {...state, feedback};
    case 'QUERY_ERROR':
      return {...state, lastQueryError: {view: action.view, error: action.error}};
    default:
      return state;
  }
}
