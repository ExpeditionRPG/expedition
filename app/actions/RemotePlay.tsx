import React from 'react'
import Redux from 'redux'
import {toCard} from './Card'
import {remotePlaySettings} from '../Constants'
import {LocalAction, NavigateAction, ReturnAction, getRemoteAction} from './ActionTypes'
import {UserState} from '../reducers/StateTypes'
import {logEvent} from '../Main'
import {openSnackbar} from '../actions/Snackbar'
import {RemotePlayEvent} from 'expedition-qdl/lib/remote/Events'
import {getRemotePlayClient} from '../RemotePlay'

export function local(a: Redux.Action): LocalAction {
  const inflight = (a as any)._inflight;
  return {type: 'LOCAL', action: a, _inflight: inflight} as any as LocalAction;
}

export function remotePlayDisconnect() {
  getRemotePlayClient().disconnect();
  return {type: 'REMOTE_PLAY_DISCONNECT'};
}

export function handleRemotePlayEvent(e: RemotePlayEvent) {
  return (dispatch: Redux.Dispatch<any>): any => {
    switch (e.event.type) {
      case 'INFLIGHT_COMMIT':
        dispatch({type: 'INFLIGHT_COMMIT', id: e.id});
        break;
      case 'INFLIGHT_REJECT':
        dispatch({type: 'INFLIGHT_REJECT', id: e.id, error: e.event.error});
        break;
      case 'STATUS':
        dispatch({
          type: 'REMOTE_PLAY_CLIENT_STATUS',
          client: e.client,
          instance: e.instance,
          status: e.event
        });
        break;
      case 'INTERACTION':
        // Interaction events must not be dispatched.
        break;
      case 'ACTION':
        const a = getRemoteAction(e.event.name);
        if (!a) {
          console.log('Received unknown remote action ' + e.event.name);
        } else {
          console.log('Inbound: ' + e.event.name + '(' + e.event.args + ')');
          // Note: This is still dispatched locally; it's called as a
          // secondary dispatch.
          dispatch(a(JSON.parse(e.event.args)));
        }
        break;
      case 'ERROR':
        console.error(JSON.stringify(e.event));
        break;
      default:
        console.log('UNKNOWN EVENT ' + (e.event as any).type);
    }
  };
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
    .then((response: Response) => {
      return response.json();
    })
    .then((data: any) => {
      if (!data.session) {
        return dispatch(openSnackbar('Error parsing session'));
      }
      session = data.session;

      const c = getRemotePlayClient();
      c.configure(clientID, instanceID);
      return c.connect(session, secret);
    })
    .then(() => {
      dispatch({type: 'REMOTE_PLAY_SESSION', session: {secret, id: session}});
      dispatch(toCard({name: 'REMOTE_PLAY', phase: 'LOBBY'}));
    })
    .catch((error: Error) => {
      logEvent('remote_play_connect_err', error.toString());
      console.error(error);
      dispatch(openSnackbar('Error connecting: ' + error.toString()));
    });
  };
}

// TODO: Move to RemotePlay actions file
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
