import {dialogs} from './Dialogs'
import {snackbar} from './Snackbar'
import {user} from './User'
import {view} from './View'
import {AppState} from './StateTypes'

export default function combinedReduce(state: AppState, action: any): AppState {
  state = state || ({} as AppState);
  return {
    dialogs: dialogs(state.dialogs, action),
    snackbar: snackbar(state.snackbar, action),
    user: user(state.user, action),
    view: view(state.view, action),
  };
}
