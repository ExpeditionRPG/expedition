import Redux from 'redux'
import {annotations} from './Annotations'
import {dialogs} from './Dialogs'
import {editor} from './Editor'
import {errors} from './Errors'
import {quest} from './Quest'
import {snackbar} from './Snackbar'
import {user} from './User'
import preview from 'expedition-app/app/reducers/CombinedReducers'
import {AppState} from './StateTypes'

export default function combinedReduce(state: AppState, action: Redux.Action): AppState {
  state = state || ({} as AppState);

  if (action.type === 'REBOOT_APP') {
    state.preview = undefined;
  }

  return {
    annotations: annotations(state.annotations, action),
    dialogs: dialogs(state.dialogs, action),
    editor: editor(state.editor, action),
    errors: errors(state.errors, action),
    preview: preview(state.preview, action),
    quest: quest(state.quest, action),
    snackbar: snackbar(state.snackbar, action),
    user: user(state.user, action),
  };
}
