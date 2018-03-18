import React from 'react'
import Redux from 'redux'
import {toCard} from './Card'
import {handleFetchErrors} from './Web'
import {remotePlaySettings} from '../Constants'
import {LocalAction, NavigateAction, ReturnAction, RemotePlayClientStatus} from './ActionTypes'
import {UserState} from '../reducers/StateTypes'
import {logEvent} from '../Main'
import {openSnackbar} from '../actions/Snackbar'
import {RemotePlayEvent, StatusEvent} from 'expedition-qdl/lib/remote/Events'
import {getRemotePlayClient} from '../RemotePlay'

export function local(a: Redux.Action): LocalAction {
  const inflight = (a as any)._inflight;
  return {type: 'LOCAL', action: a, _inflight: inflight} as any as LocalAction;
}

export function remotePlayDisconnect() {
  getRemotePlayClient().disconnect();
  return {type: 'REMOTE_PLAY_DISCONNECT'};
}

export function remotePlayNewSession(user: UserState) {
  return (dispatch: Redux.Dispatch<any>): any => {
    fetch(remotePlaySettings.newSessionURI, {
      method: 'POST',
      mode: 'cors',
      headers: new Headers({
        'Accept': 'text/html',
      }),
      credentials: 'include',
    })
    .then(handleFetchErrors)
    .then((response: Response) => {
      return response.json();
    })
    .then((data: any) => {
      if (!data.secret) {
        return dispatch(openSnackbar('Error parsing new session secret'));
      }
      return dispatch(remotePlayConnect(user, data.secret));
    })
    .catch((error: Error) => {
      logEvent('remote_play_new_session_err', error.toString());
      dispatch(openSnackbar('Error creating session: ' + error.toString()));
    });
  };
}

export function remotePlayConnect(user: UserState, secret: string) {
  let session = '';
  const clientID = user.id.toString();
  const instanceID = Date.now().toString();

  return (dispatch: Redux.Dispatch<any>): any => {
    fetch(remotePlaySettings.connectURI, {
      method: 'POST',
      mode: 'cors',
      headers: new Headers({
        'Accept': 'application/json',
      }),
      credentials: 'include',
      body: JSON.stringify({instance: instanceID, secret}),
    })
    .then(handleFetchErrors)
    .then((response: Response) => {
      return response.json();
    })
    .then((data: any) => {
      if (!data.session) {
        return dispatch(openSnackbar('Error parsing session'));
      }
      session = data.session;
    })
    .then(() => {
      // Dispatch navigation and settings **before** opening the client connection.
      // This lets us navigate to the lobby, then immediately receive a MULTI_EVENT
      // to fast-forward to the current state.
      dispatch({type: 'REMOTE_PLAY_SESSION', session: {secret, id: session}});
      return dispatch(toCard({name: 'REMOTE_PLAY', phase: 'LOBBY'}));
    })
    .then(() => {
      const c = getRemotePlayClient();
      c.configure(clientID, instanceID);
      return c.connect(session, secret);
    })
    .catch((error: Error) => {
      logEvent('remote_play_connect_err', error.toString());
      console.error(error);
      dispatch(openSnackbar('Error connecting: ' + error.toString()));
    });
  };
}

export function loadRemotePlay(user: UserState) {
  return (dispatch: Redux.Dispatch<any>): any => {
    if (!user || !user.id) {
      throw new Error('you are not logged in');
    }
    fetch(remotePlaySettings.firstLoadURI, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
    })
    // NOTE: We do not handle fetch errors here - failing this
    // fetch should not prevent users from using remote play.
    // .then(handleFetchErrors)
    .then((response: Response) => {
      return response.json();
    })
    .then((data: any) => {
      dispatch({type: 'REMOTE_PLAY_HISTORY', history: data.history});
      dispatch(toCard({name: 'REMOTE_PLAY', phase: 'CONNECT'}));
    })
    .catch((error: Error) => {
      logEvent('remote_play_init_err', error.toString());
      dispatch(openSnackbar('Remote play service unavailable: ' + error.toString()));
    })
  };
}

export function setRemoteStatus(ev: StatusEvent) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const c = getRemotePlayClient();
    c.sendStatus(ev);
    dispatch({
      type: 'REMOTE_PLAY_CLIENT_STATUS',
      client: c.getID(),
      instance: c.getInstance(),
      status: ev,
    } as RemotePlayClientStatus);
    return null;
  }
}
