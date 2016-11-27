import {quest} from './quest'
import {dirty} from './dirty'
import {user} from './user'
import {dialogs} from './dialogs'
import {errors} from './errors'
import {annotations} from './annotations'
import preview from 'expedition-app/app/reducers/CombinedReducers'
import {AppState} from './StateTypes'

export default function combinedReduce(state: AppState, action: Redux.Action): AppState {
  state = state || ({} as AppState);
  return {
    quest: quest(state.quest, action),
    dirty: dirty(state.dirty, action),
    user: user(state.user, action),
    dialogs: dialogs(state.dialogs, action),
    errors: errors(state.errors, action),
    annotations: annotations(state.annotations, action),
    preview: preview(state.preview, action),
  };
}