import Redux from 'redux';
import {StatusEvent} from 'shared/multiplayer/Events';
import {openSnackbar} from '../actions/Snackbar';
import {MULTIPLAYER_SETTINGS} from '../Constants';
import {logEvent} from '../Logging';
import {getMultiplayerClient} from '../Multiplayer';
import {MultiplayerSessionMeta, UserState} from '../reducers/StateTypes';
import {LocalAction, MultiplayerClientStatus} from './ActionTypes';
import {toCard} from './Card';
import {handleFetchErrors} from './Web';

export function local(a: Redux.Action): LocalAction {
  const inflight = (a as any)._inflight;
  return {type: 'LOCAL', action: a, _inflight: inflight} as any as LocalAction;
}

export function multiplayerDisconnect() {
  getMultiplayerClient().disconnect();
  return {type: 'MULTIPLAYER_DISCONNECT'};
}

export function multiplayerNewSession(user: UserState) {
  return (dispatch: Redux.Dispatch<any>): any => {
    fetch(MULTIPLAYER_SETTINGS.newSessionURI, {
      credentials: 'include',
      headers: new Headers({
        Accept: 'text/html',
      }),
      method: 'POST',
      mode: 'cors',
    })
    .then(handleFetchErrors)
    .then((response: Response) => response.json())
    .then((data: {secret: string}) => {
      if (!data.secret) {
        return dispatch(openSnackbar(Error('Error parsing new session secret')));
      }
      logEvent('multiplayer', 'new_session', {label: data.secret});
      return dispatch(multiplayerConnect(user, data.secret));
    })
    .catch((error: Error) => {
      logEvent('multiplayer', 'new_session_err', {label: error.toString()});
      dispatch(openSnackbar(Error('Error creating session: ' + error.toString())));
    });
  };
}

export function multiplayerConnect(user: UserState, secret: string) {
  let sessionID = '';
  const clientID = user.id.toString();
  const instanceID = Date.now().toString();

  return (dispatch: Redux.Dispatch<any>): any => {
    fetch(MULTIPLAYER_SETTINGS.connectURI, {
      body: JSON.stringify({instance: instanceID, secret}),
      credentials: 'include',
      headers: new Headers({
        Accept: 'application/json',
      }),
      method: 'POST',
      mode: 'cors',
    })
    .then(handleFetchErrors)
    .then((response: Response) => response.json())
    .then((data: {session: string}) => {
      if (!data.session) {
        return dispatch(openSnackbar(Error('Error parsing session')));
      }
      sessionID = data.session;
    })
    .then(() => {
      // Dispatch navigation and settings **before** opening the client connection.
      // This lets us navigate to the lobby, then immediately receive a MULTI_EVENT
      // to fast-forward to the current state.
      dispatch({type: 'MULTIPLAYER_SESSION', session: {secret, id: sessionID}});
      return dispatch(toCard({name: 'REMOTE_PLAY', phase: 'LOBBY'}));
    })
    .then(() => {
      const c = getMultiplayerClient();
      c.configure(clientID, instanceID);
      return c.connect(sessionID, secret);
    })
    .catch((error: Error) => {
      logEvent('multiplayer', 'connect_err', {label: error.toString()});
      console.error(error);
      dispatch(openSnackbar(Error('Error connecting: ' + error.toString())));
    });
  };
}

export function loadMultiplayer(user: UserState) {
  return (dispatch: Redux.Dispatch<any>): any => {
    if (!user || !user.id) {
      throw new Error('you are not logged in');
    }
    fetch(MULTIPLAYER_SETTINGS.firstLoadURI, {
      credentials: 'include',
      method: 'GET',
      mode: 'cors',
    })
    // NOTE: We do not handle fetch errors here - failing this
    // fetch should not prevent users from using multiplayer.
    // .then(handleFetchErrors)
    .then((response: Response) => response.json())
    .then((data: {history: MultiplayerSessionMeta[]}) => {
      dispatch({type: 'MULTIPLAYER_HISTORY', history: data.history});
      dispatch(toCard({name: 'REMOTE_PLAY', phase: 'CONNECT'}));
    })
    .catch((error: Error) => {
      logEvent('multiplayer', 'init_err', {label: error.toString()});
      dispatch(openSnackbar(Error('Multiplayer unavailable: ' + error.toString())));
    });
  };
}

export function setMultiplayerStatus(ev: StatusEvent) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const c = getMultiplayerClient();
    c.sendStatus(ev);
    dispatch({
      client: c.getID(),
      instance: c.getInstance(),
      status: ev,
      type: 'MULTIPLAYER_CLIENT_STATUS',
    } as MultiplayerClientStatus);
    return null;
  };
}
