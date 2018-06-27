import Redux from 'redux';
import {ViewType} from '../reducers/StateTypes';
import {SetViewAction} from './ActionTypes';
import {feedbackQuery, questsQuery, usersQuery} from './Web';

export function setView(view: ViewType): SetViewAction {
  return {type: 'SET_VIEW', view};
}

export function queryView(view: ViewType, filter?: string, order?: {column: string, ascending: boolean}) {
  return (dispatch: Redux.Dispatch<any>) => {
    switch (view) {
      case 'USERS':
      dispatch(usersQuery({
        order: order || {column: 'last_login', ascending: false},
        substring: filter,
      }));
      break;
      case 'QUESTS':
      dispatch(questsQuery({
        order: order || {column: 'created', ascending: false},
        substring: filter,
      }));
      break;
      case 'FEEDBACK':
      dispatch(feedbackQuery({
        order: order || {column: 'created', ascending: true},
        substring: filter,
      }));
      break;
      default:
        console.error('Unknown view ' + view);
    }
  };
}
