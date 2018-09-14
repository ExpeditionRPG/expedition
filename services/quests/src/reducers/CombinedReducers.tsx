import preview from 'app/reducers/CombinedReducers';
import Redux from 'redux';
import {annotations} from './Annotations';
import {announcement} from './Announcement';
import {dialogs} from './Dialogs';
import {editor} from './Editor';
import {quest} from './Quest';
import {snackbar} from './Snackbar';
import {AppState} from './StateTypes';
import {tutorial} from './Tutorial';
import {user} from './User';

export default function combinedReduce(state: AppState, action: Redux.Action): AppState {
  state = state || ({} as AppState);

  if (action.type === 'REBOOT_APP') {
    // Setting to undefined here causes defaults to be populated in the preview() reducer.
    state.preview = (undefined as any);
  }

  return {
    announcement: announcement(state.announcement, action),
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
