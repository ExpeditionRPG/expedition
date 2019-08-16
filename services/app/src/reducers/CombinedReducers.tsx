import Redux from 'redux';
import {audio} from './Audio';
import {audioData} from './AudioData';
import {card} from './Card';
import {checkout} from './Checkout';
import {commitID} from './CommitID';
import {dialog} from './Dialog';
import {history} from './History';
import {multiplayer} from './Multiplayer';
import {quest} from './Quest';
import {saved} from './Saved';
import {search} from './Search';
import {serverstatus} from './ServerStatus';
import {settings} from './Settings';
import {snackbar} from './Snackbar';
import {AppState, AppStateWithHistory} from './StateTypes';
import {user} from './User';
import {userquests} from './UserQuests';

function combinedReduce(state: AppStateWithHistory, action: Redux.Action): AppState {
  state = state || ({} as AppStateWithHistory);
  return {
    audio: audio(state.audio, action),
    audioData: audioData(state.audioData, action),
    card: card(state.card, action),
    checkout: checkout(state.checkout, action),
    commitID: state.commitID, // Handled by CommitID()
    dialog: dialog(state.dialog, action),
    multiplayer: multiplayer(state.multiplayer, action),
    quest: quest(state.quest, action),
    saved: saved(state.saved, action),
    search: search(state.search, action),
    serverstatus: serverstatus(state.serverstatus, action),
    settings: settings(state.settings, action),
    snackbar: snackbar(state.snackbar, action),
    user: user(state.user, action),
    userQuests: userquests(state.userQuests, action),
  };
}

export default function combinedReducerWithHistory(state: AppStateWithHistory, action: Redux.Action): AppStateWithHistory {
  // Run global reducers
  state = commitID(state, action, combinedReduce);
  state = history(state, action);

  // Run the reducers on the new action
  return {
    ...combinedReduce(state, action),
    _committed: (state && state._committed),
  } as AppStateWithHistory;
}
