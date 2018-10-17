import Redux from 'redux';
import {ServerStatusSetAction} from '../actions/ActionTypes';
import {ServerStatusState} from './StateTypes';

export const initialServerStatusState: ServerStatusState = {
  announcement: {
    link: '',
    message: '',
    open: false,
  },
  isLatestAppVersion: false,
};

export function serverstatus(state: ServerStatusState = initialServerStatusState, action: Redux.Action): ServerStatusState {
  switch (action.type) {
    case 'SERVER_STATUS_SET':
      return {
        ...initialServerStatusState,
        ...(action as ServerStatusSetAction).delta,
      };
    default:
      return state;
  }
}
