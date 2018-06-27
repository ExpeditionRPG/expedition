import Redux from 'redux';
import {AnnouncementSetAction} from '../actions/ActionTypes';
import {AnnouncementState} from './StateTypes';

const initialState: AnnouncementState = {
  link: '',
  message: '',
  open: false,
};

export function announcement(state: AnnouncementState = initialState, action: Redux.Action): AnnouncementState {
  switch (action.type) {
    case 'ANNOUNCEMENT_SET':
      const setAction = (action as AnnouncementSetAction);
      return {
        link: setAction.link || initialState.link,
        message: setAction.message || initialState.message,
        open: setAction.open || initialState.open,
      };
    default:
      return state;
  }
}
