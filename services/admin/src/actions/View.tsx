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
        substring: filter,
        order: order || {column: 'last_login', ascending: false},
      }));
      break;
      case 'QUESTS':
      dispatch(questsQuery({
        substring: filter,
        order: order || {column: 'created', ascending: false},
      }));
      break;
      case 'FEEDBACK':
      dispatch(feedbackQuery({
        substring: filter,
        order: order || {column: 'created', ascending: true},
      }));
      break;
      default:
        console.error('Unknown view ' + view);
    }
  };
}
