import Redux from 'redux'
import {quest} from './quest'
import {editor} from './editor'
import {user} from './user'
import {dialogs} from './dialogs'
import {errors} from './errors'
import {annotations} from './annotations'
import preview from 'expedition-app/app/reducers/CombinedReducers'
import {AppState} from './StateTypes'

export default function combinedReduce(state: AppState, action: Redux.Action): AppState {
  state = state || ({} as AppState);

  if (action.type === 'REBOOT_APP') {
    state.preview = undefined;
  }

  return {
    quest: quest(state.quest, action),
    editor: editor(state.editor, action),
    user: user(state.user, action),
    dialogs: dialogs(state.dialogs, action),
    errors: errors(state.errors, action),
    annotations: annotations(state.annotations, action),
    preview: preview(state.preview, action),
  };
}