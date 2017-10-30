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
  return {type: 'LOCAL', action: a};
}

export function handleRemotePlayEvent(e: RemotePlayEvent) {
  return (dispatch: Redux.Dispatch<any>): any => {
    switch (e.event.type) {
      case 'STATUS':
        console.log('TODO: USE STATUS ' + JSON.stringify(e.event));
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
  return (dispatch: Redux.Dispatch<any>): any => {
    fetch(remotePlaySettings.connectURI, {
      method: 'POST',
      mode: 'cors',
      headers: new Headers({
        'Accept': 'application/json',
      }),
      body: JSON.stringify({secret}),
    })
    .then((response: Response) => {
      return response.json();
    })
    .then((data: any) => {
      if (!data.session) {
        console.log(data);
        return dispatch(openSnackbar('Error parsing session'));
      }
      session = data.session;

      const c = getRemotePlayClient();
      // TODO: This may need to pull some kind of repeatable "device ID"
      // to allow for reconnects.
      // For initial dev work, we make it always unique.
      c.setID(user.id.toString() + '-' + Date.now());
      return (c.connect(session, data.authToken) as any);
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
    fetch(remotePlaySettings.firstLoadURI + '?id=' + user.id, {
      method: 'GET',
      mode: 'cors',
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
