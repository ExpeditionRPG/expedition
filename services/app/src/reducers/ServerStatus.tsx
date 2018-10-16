import Redux from 'redux';
import {ServerStatusSetAction} from '../actions/ActionTypes';
import {ServerStatusState} from './StateTypes';

const initialState: ServerStatusState = {
  announcement: {
    link: '',
    message: '',
    open: false,
  },
  isLatestAppVersion: false,
};

export function serverstatus(state: ServerStatusState = initialState, action: Redux.Action): ServerStatusState {
  switch (action.type) {
    case 'SERVER_STATUS_SET':
      return {
        ...initialState,
        ...(action as ServerStatusSetAction).delta,
      };
    default:
      return state;
  }
}
