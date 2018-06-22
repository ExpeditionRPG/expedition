import Redux from 'redux'
import {annotations} from './Annotations'
import {dialogs} from './Dialogs'
import {editor} from './Editor'
import {quest} from './Quest'
import {snackbar} from './Snackbar'
import {tutorial} from './Tutorial'
import {user} from './User'
import preview from '@expedition-app/reducers/CombinedReducers'
import {AppState} from './StateTypes'

export default function combinedReduce(state: AppState, action: Redux.Action): AppState {
  state = state || ({} as AppState);

  if (action.type === 'REBOOT_APP') {
    // Setting to undefined here causes defaults to be populated in the preview() reducer.
    state.preview = (undefined as any);
  }

  return {
    annotations: annotations(state.annotations, action),
    dialogs: dialogs(state.dialogs, action),
    editor: editor(state.editor, action),
    preview: preview(state.preview, action),
    quest: quest(state.quest, action),
    snackbar: snackbar(state.snackbar, action),
    tutorial: tutorial(state.tutorial, action),
    user: user(state.user, action),
  };
}
