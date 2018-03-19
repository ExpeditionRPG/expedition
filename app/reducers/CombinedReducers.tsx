import Redux from 'redux'
import {dialogs} from './Dialogs'
import {snackbar} from './Snackbar'
import {user} from './User'
import {AppState} from './StateTypes'

export default function combinedReduce(state: AppState, action: Redux.Action): AppState {
  state = state || ({} as AppState);
  return {
    dialogs: dialogs(state.dialogs, action),
    snackbar: snackbar(state.snackbar, action),
    user: user(state.user, action),
  };
}
