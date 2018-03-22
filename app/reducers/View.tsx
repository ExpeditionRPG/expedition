import Redux from 'redux'
import {SetViewAction, SetViewFeedbackAction} from '../actions/ActionTypes'
import {ViewState} from './StateTypes'

export const defaultView: ViewState = {
  view: 'FEEDBACK',
  feedback: [{partition: 'expedition-public', quest: {id: '129348', title: 'test quest'}, user: {id: '12345', email: 'asdf@ghkjl.com'}, rating: 5, text: 'Test feedback'}],
  users: [{id: '12345', email: 'asdf@ghjkl.com', name: 'Test user', loot_points: 5, last_login: new Date()}],
  quests: [{id: '129348', title: 'test quest', partition: 'expedition-public', ratingavg: 3.5, ratingcount: 10, user: {id: '12345', email: 'author@test.com'}, visibility: 'PUBLIC'}],
};

export function view(state: ViewState = defaultView, action: Redux.Action): ViewState {
  switch(action.type) {
    case 'SET_VIEW':
      return {...state, view: (action as SetViewAction).view};      
    case 'SET_VIEW_FEEDBACK':
      return {...state, feedback: (action as SetViewFeedbackAction).entries};
    default:
      return state;
  }
}
