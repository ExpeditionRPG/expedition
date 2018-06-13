import Redux from 'redux'
import {AnnouncementSetAction} from '../actions/ActionTypes'
import {AnnouncementState} from './StateTypes'

const initialState: AnnouncementState = {
  open: false,
  message: '',
  link: '',
};

export function announcement(state: AnnouncementState = initialState, action: Redux.Action): AnnouncementState {
  switch(action.type) {
    case 'ANNOUNCEMENT_SET':
      const setAction = (action as AnnouncementSetAction);
      return {
        open: setAction.open || initialState.open,
        message: setAction.message || initialState.message,
        link: setAction.link || initialState.link,
      };
    default:
      return state;
  }
}
