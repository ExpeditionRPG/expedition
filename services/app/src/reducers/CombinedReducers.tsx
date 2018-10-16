import Redux from 'redux';
import {ReturnAction} from '../actions/ActionTypes';
import {getHistoryApi, getNavigator} from '../Globals';
import {announcement} from './Announcement';
import {audio} from './Audio';
import {audioData} from './AudioData';
import {card} from './Card';
import {checkout} from './Checkout';
import {commitID} from './CommitID';
import {dialog} from './Dialog';
import {multiplayer} from './Multiplayer';
import {quest} from './Quest';
import {saved} from './Saved';
import {search} from './Search';
import {settings} from './Settings';
import {snackbar} from './Snackbar';
import {AppState, AppStateBase, AppStateWithHistory} from './StateTypes';
import {user} from './User';
import {userquests} from './UserQuests';

function combinedReduce(state: AppStateWithHistory, action: Redux.Action): AppState {
  state = state || ({} as AppStateWithHistory);
  return {
    announcement: announcement(state.announcement, action),
    audio: audio(state.audio, action),
    card: card(state.card, action),
    checkout: checkout(state.checkout, action),
    commitID: state.commitID, // Handled by CommitID()
    dialog: dialog(state.dialog, action),
    multiplayer: multiplayer(state.multiplayer, action),
    quest: quest(state.quest, action),
    userQuests: userquests(state.userQuests, action),
    saved: saved(state.saved, action),
    search: search(state.search, action),
    settings: settings(state.settings, action),
    snackbar: snackbar(state.snackbar, action),
    user: user(state.user, action),
    audioData: audioData(state.audioData, action),
  };
}

function isReturnState(state: AppStateBase, action: ReturnAction): boolean {
  const matchesName = state.card.name === action.to.name;
  const matchesPhase = (action.to.phase && state.card && action.to.phase === state.card.phase);
  return (matchesName && (!action.to.phase || matchesPhase)) || false;
}

export default function combinedReducerWithHistory(state: AppStateWithHistory, action: Redux.Action): AppStateWithHistory {
  let stateHistory: AppStateBase[] = [];

  // Manage CommitID transactions
  state = commitID(state, action, combinedReduce);

  if (state !== undefined) {
    if (state._history === undefined) {
      state._history = [];
    }

    // TODO: Convert history into a separate reducer.
    // If action is "Return", pop history accordingly
    if (action.type === 'RETURN') {
      // Backing all the way out of the Android app should kill it
      if (state._history.length === 0) {
        const navigator = getNavigator();
        if (navigator.app) {
            navigator.app.exitApp();
        } else if (navigator.device) {
            navigator.device.exitApp();
        }
      }

      let pastStateIdx: number = state._history.length - 1;
      const returnAction = action as ReturnAction;
      if (returnAction.to && (returnAction.to.name || returnAction.to.phase)) {
        while (pastStateIdx > 0 && !isReturnState(state._history[pastStateIdx], returnAction)) {
          pastStateIdx--;
        }
      } else if (returnAction.skip) {
        // Skip past any explicitly blacklisted card types
        while (pastStateIdx > 0) {
          let skipCard: boolean = false;
          for (const s of returnAction.skip) {
            if (s.name === state._history[pastStateIdx].card.name && (!s.phase || s.phase === state._history[pastStateIdx].card.phase)) {
              skipCard = true;
              break;
            }
          }
          if (!skipCard) {
            break;
          }
          pastStateIdx--;
        }
      }

      if (returnAction.before) {
        pastStateIdx--;
      }

      // If we're going back to a point where the quest is no longer defined, clear the URL hash
      if (pastStateIdx === 0 ||
         (state._history[pastStateIdx - 1] && state._history[pastStateIdx - 1].quest && state._history[pastStateIdx - 1].quest.details.id === '')) {
        getHistoryApi().pushState(null, '', '#');
      }

      return {
        ...state._history[pastStateIdx],
        _committed: state._committed,
        _history: state._history.slice(0, pastStateIdx),
        _return: true,
        // things that should persist / not be rewound:
        commitID: state.commitID,
        multiplayer: state.multiplayer,
        saved: state.saved,
        userQuests: state.userQuests,
        settings: state.settings,
        user: state.user,
        audioData: state.audioData,
        snackbar: state.snackbar,
      } as AppStateWithHistory;
    } else if (action.type === 'CLEAR_HISTORY') {
      return {
        ...state,
        _history: [],
      };
    }

    // Create a new array (objects may be shared)
    stateHistory = state._history.slice();

    if (action.type === 'PUSH_HISTORY') {
      // Save a copy of existing state to _history, excluding non-historical fields.
      stateHistory.push({
        ...state,
        _committed: undefined,
        _history: undefined,
        _return: undefined,
        commitID: undefined,
        multiplayer: undefined,
        saved: undefined,
        userQuests: undefined,
        settings: undefined,
        user: undefined,
        audioData: undefined,
        snackbar: undefined,
      } as AppStateBase);
    }
  }

  // Run the reducers on the new action
  return {...combinedReduce(state, action),
    _committed: (state && state._committed),
    _history: stateHistory,
    _return: false,
  } as AppStateWithHistory;
}
