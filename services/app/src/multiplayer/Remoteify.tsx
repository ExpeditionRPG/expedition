import * as Redux from 'redux';
import { AppStateWithHistory } from '../reducers/StateTypes';

// Returns a generator of an "executable array" of the original action.
// This array can be passed to the generated Multiplayer redux middleware
// which invokes it and packages it to send to other multiplayer clients.
const MULTIPLAYER_ACTIONS: {
  [action: string]: (args: any) => Redux.Action;
} = {};
// `dispatch` and `getState` are neither optional nor history-free: the
// multiplayer middleware always supplies both when it invokes a remoted action
// (Middleware.tsx does `fn(args, dispatch, getState)` with the real store's
// getState, which returns AppStateWithHistory). Declaring them
// `dispatch?: ... , getState?: () => AppState` made every action that names
// them the way they are actually called unassignable here.
export function remoteify<A>(
  a: (
    args: A,
    dispatch: Redux.Dispatch<any>,
    getState: () => AppStateWithHistory,
  ) => any,
) {
  const remoted = (args: A) => {
    return [a.name, a, args] as any as Redux.Action; // We know better >:}
  };
  if (MULTIPLAYER_ACTIONS[a.name]) {
    console.error(
      'ERROR: Multiplayer action ' +
        a.name +
        ' already registered elsewhere! This will break multiplayer!',
    );
  }
  MULTIPLAYER_ACTIONS[a.name] = remoted;
  return remoted;
}
export function getMultiplayerAction(name: string) {
  return MULTIPLAYER_ACTIONS[name];
}
export function clearMultiplayerActions() {
  for (const k of Object.keys(MULTIPLAYER_ACTIONS)) {
    delete MULTIPLAYER_ACTIONS[k];
  }
}
