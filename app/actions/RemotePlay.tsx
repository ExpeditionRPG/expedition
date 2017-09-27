import Redux from 'redux'
import {toCard} from './Card'
import {remotePlaySettings} from '../Constants'
import {RemotePlayAction, NavigateAction, ReturnAction} from './ActionTypes'
import {UserState} from '../reducers/StateTypes'
import {logEvent} from '../Main'
import {openSnackbar} from '../actions/Snackbar'
import {RemotePlayEvent} from 'expedition-qdl/lib/remote/Events'
import {getRemotePlayClient} from '../RemotePlay'

export function local(a: Redux.Action): RemotePlayAction {
  // We return a 'remote play' action here as it's not re-broadcast by
  // remote play middleware.
  return {type: 'REMOTE_PLAY_ACTION', action: a};
}

export function handleRemotePlayEvent(e: RemotePlayEvent) {
  return (dispatch: Redux.Dispatch<any>): any => {
    switch (e.event.type) {
      case 'STATUS':
        console.log('TODO: USE STATUS ' + JSON.stringify(e.event));
        break;
      case 'TOUCH':
        // We don't care about dispatching touch events (they're tracked elsewhere)
        break;
      case 'ACTION':
        // dispatch(getAction(a.fn)(a));
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
        'Content-Type': 'text/html',
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
  let uri = '';
  return (dispatch: Redux.Dispatch<any>): any => {
    fetch(remotePlaySettings.connectURI, {
      method: 'POST',
      mode: 'cors',
      headers: new Headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({secret}),
    })
    .then((response: Response) => {
      return response.json();
    })
    .then((data: any) => {
      if (!data.uri) {
        return dispatch(openSnackbar('Error parsing session URI'));
      }
      uri = data.uri;
      const c = getRemotePlayClient();
      c.setID(user.id.toString());
      return c.connect(uri);
    })
    .then(() => {
      dispatch({type: 'REMOTE_PLAY_SESSION', session: {secret}, uri});
      dispatch(toCard('REMOTE_PLAY', 'LOBBY'));
    })
    .catch((error: Error) => {
      logEvent('remote_play_connect_err', error.toString());
      dispatch(openSnackbar('Error connecting: ' + error.toString()));
    });
  };
}

// TODO: Move to RemotePlay actions file
export function loadRemotePlay(user: UserState) {
  return (dispatch: Redux.Dispatch<any>): any => {
    fetch(remotePlaySettings.firstLoadURI + '?id=' + user.id, {
      method: 'GET',
      mode: 'cors',
    })
    .then((response: Response) => {
      return response.json();
    })
    .then((data: any) => {
      dispatch({type: 'REMOTE_PLAY_HISTORY', history: data.history});
      dispatch(toCard('REMOTE_PLAY', 'CONNECT'));
    })
    .catch((error: Error) => {
      logEvent('remote_play_init_err', error.toString());
      dispatch(openSnackbar('Remote play service unavailable: ' + error.toString()));
    })
  };
}
