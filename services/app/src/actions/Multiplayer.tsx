import Redux from 'redux';
import {MultiplayerEvent, MultiplayerEventBody, StatusEvent} from 'shared/multiplayer/Events';
import {handleFetchErrors} from 'shared/requests';
import {openSnackbar} from '../actions/Snackbar';
import {MULTIPLAYER_SETTINGS} from '../Constants';
import {logEvent} from '../Logging';
import {ConnectionHandler, getMultiplayerConnection} from '../multiplayer/Connection';
import {getMultiplayerAction} from '../multiplayer/Remoteify';
import {AppStateWithHistory, MultiplayerSessionMeta, MultiplayerState, UserState} from '../reducers/StateTypes';
import {LocalAction, MultiplayerClientStatus, MultiplayerConnectedAction, MultiplayerMultiEventStartAction} from './ActionTypes';
import {toCard} from './Card';

export function local(a: Redux.Action): LocalAction {
  const inflight = (a as any)._inflight;
  return {type: 'LOCAL', action: a, _inflight: inflight} as any as LocalAction;
}

export function multiplayerDisconnect(c= getMultiplayerConnection()) {
  c.disconnect();
  return {type: 'MULTIPLAYER_DISCONNECT'};
}

function doConnect(user: UserState, secret: string, dispatch: Redux.Dispatch<any>, c= getMultiplayerConnection(), fetch: any = window.fetch) {
  let sessionID = '';
  const clientID = user.id.toString();
  const instanceID = Date.now().toString();
  return fetch(MULTIPLAYER_SETTINGS.connectURI, {
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
    c.configure(clientID, instanceID);
    return c.connect(sessionID, secret);
  });
}

export function multiplayerNewSession(user: UserState, c= getMultiplayerConnection(), fetch: any = window.fetch) {
  return (dispatch: Redux.Dispatch<any>): any => {
    return fetch(MULTIPLAYER_SETTINGS.newSessionURI, {
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
      return doConnect(user, data.secret, dispatch, c, fetch);
    })
    .catch((error: Error) => {
      logEvent('multiplayer', 'new_session_err', {label: error.toString()});
      dispatch(openSnackbar(Error('Error creating session: ' + error.toString())));
    });
  };
}

export function multiplayerConnect(user: UserState, secret: string, c= getMultiplayerConnection(), fetch: any = window.fetch) {
  return (dispatch: Redux.Dispatch<any>): any => {
    return doConnect(user, secret, dispatch, c, fetch)
      .catch((error: Error) => {
        logEvent('multiplayer', 'connect_err', {label: error.toString()});
        console.error(error);
        dispatch(openSnackbar(Error('Error connecting: ' + error.toString())));
      });
  };
}

export function loadMultiplayer(user: UserState, fetch: any = window.fetch) {
  return (dispatch: Redux.Dispatch<any>): any => {
    if (!user || !user.id) {
      throw new Error('you are not logged in');
    }

    return fetch(MULTIPLAYER_SETTINGS.firstLoadURI, {
      credentials: 'include',
      method: 'GET',
      mode: 'cors',
    })
    // NOTE: We do not handle fetch errors here - failing this
    // fetch should not prevent users from using multiplayer.
    .then((response: Response) => response.json())
    .then((data: {history: MultiplayerSessionMeta[]}) => {
      dispatch({type: 'MULTIPLAYER_HISTORY', history: data.history});
      dispatch(toCard({name: 'REMOTE_PLAY', phase: 'CONNECT'}));
    })
    .catch((error: Error) => {
      console.error(error);
      logEvent('multiplayer', 'init_err', {label: error.toString()});
      dispatch(toCard({name: 'REMOTE_PLAY', phase: 'CONNECT'}));
    });
  };
}

export function setMultiplayerStatus(ev: StatusEvent, c= getMultiplayerConnection()) {
  return (dispatch: Redux.Dispatch<any>): any => {
    if (c.sendStatus) {
      c.sendStatus(ev);
    }
    dispatch({
      client: c.getID(),
      instance: c.getInstance(),
      status: ev,
      type: 'MULTIPLAYER_CLIENT_STATUS',
    } as MultiplayerClientStatus);
    return null;
  };
}

export function setMultiplayerConnected(connected: boolean): MultiplayerConnectedAction {
  return {type: 'MULTIPLAYER_CONNECTED', connected};
}

export function syncMultiplayer(c = getMultiplayerConnection()) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch({type: 'CLEAR_HISTORY'});
    dispatch({type: 'MULTIPLAYER_SYNC'});
    c.sync();
    sendStatus(undefined, undefined, undefined, c);
    dispatch(openSnackbar(new Error('Was there a bug?'), true));
  };
}

export function sendStatus(client?: string, instance?: string, partialStatus?: StatusEvent, c= getMultiplayerConnection()) {
  return (dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): any => {
    const {multiplayer, settings, commitID, quest} = getState();
    const elem = (quest && quest.node && quest.node.elem);
    const selfStatus = (multiplayer && multiplayer.clientStatus && multiplayer.clientStatus[multiplayer.client]);
    let event: StatusEvent = {
      connected: true,
      lastEventID: commitID,
      line: (elem && parseInt(elem.attr('data-line'), 10)),
      numLocalPlayers: (settings && settings.numLocalPlayers) || 1,
      type: 'STATUS',
      waitingOn: (selfStatus && selfStatus.waitingOn),
    };
    if (partialStatus) {
      event = {...event, ...partialStatus};
    }
    client = client || multiplayer.client;
    instance = instance || multiplayer.instance;

    // Send remote if we're the origin
    if (client === multiplayer.client && instance === multiplayer.instance) {
      c.sendEvent(event, commitID);
    }

    // Dispatch locally (and publish to event subscribers)
    dispatch({type: 'MULTIPLAYER_CLIENT_STATUS', client, instance, status: event});
    c.publish({id: null, client, instance, event});
  };
}

export function sendEvent(event: MultiplayerEventBody, commitID?: number, c= getMultiplayerConnection()) {
  return (dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): any => {
    commitID = commitID || getState().commitID;
    c.sendEvent(event, commitID);
  };
}

export function subscribeToEvents(handler: (e: MultiplayerEvent) => void, c= getMultiplayerConnection()) {
  c.subscribe(handler);
}

export function unsubscribeFromEvents(handler: (e: MultiplayerEvent) => void, c= getMultiplayerConnection()) {
  c.unsubscribe(handler);
}

export function registerHandler(handler: ConnectionHandler, c= getMultiplayerConnection()) {
  c.registerHandler(handler);
}

function commit(id: number) {
  console.log('MULTIPLAYER_COMMIT #' + id);
  return {type: 'MULTIPLAYER_COMMIT', id};
}

export function rejectEvent(n: number, error: string) {
  return (dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory) => {
    console.log('MULTIPLAYER_REJECT #' + n + ': ' + error);
    dispatch({
      type: 'MULTIPLAYER_REJECT',
      id: n,
      error,
    });
  };
}

export function handleEvent(e: MultiplayerEvent, buffered: boolean, commitID: number, multiplayer: MultiplayerState, c= getMultiplayerConnection()) {
  return (dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): Promise<void> => {
    if (e.id && e.id !== (commitID + 1)) {
      // We should ignore actions that we don't expect, and instead let the server
      // know we're behind so we can fast-forward appropriately.
      // Note that MULTI_EVENTs have no top-level ID and aren't affected by this check.
      console.log('Ignoring #' + e.id + ' ' + e.event.type + ' (counter at #' + commitID + ')');
      sendStatus();
      return Promise.resolve();
    }

    const body = e.event;
    switch (body.type) {
      case 'STATUS':
        return dispatch(sendStatus(e.client, e.instance, body));
      case 'INTERACTION':
        // Interaction events are not dispatched; UI element subscribers pick up the event on publish().
        break;
      case 'ACTION':
        // Actions must have IDs.
        if (e.id === null) {
          return Promise.resolve();
        }

        // If the server is describing an event and we have a similar message buffered,
        // cancel the buffered event in favor of the server's opinion.
        // This can happen in edge cases, e.g. client sends event A, connection flaps,
        // server responds to client status with MULTI_ACTION on event A.
        if (buffered) {
          // If the event came from us, commit it. Otherwise, reject the
          // local buffered event.
          if (e.client === multiplayer.client && e.instance === multiplayer.instance) {
            dispatch(commit(e.id));
          } else {
            dispatch(rejectEvent(e.id, 'Multiplayer ACTION matching buffered'));
          }
          return Promise.resolve();
        }

        const a = getMultiplayerAction(body.name);
        if (!a) {
          console.error('Received unknown remote action ' + body.name);
          return Promise.resolve();
        }

        console.log('WS: Inbound #' + e.id + ': ' + body.name + '(' + body.args + ')');
        // Set a "remote" marker so we can handle it differently than local actions
        const action = a(JSON.parse(body.args));
        (action as any)._inflight = 'remote';

        let result: any;
        try {
          result = dispatch(local(action));
        } finally {
          if (e.id !== null) {
            commit(e.id);
          }
        }
        return result;
      case 'MULTI_EVENT':
        if (multiplayer.multiEvent) {
          console.log('Ignoring MULTI_EVENT, already parsing');
          return Promise.resolve();
        }

        let chain = Promise.resolve().then(() => {
          dispatch(local({type: 'MULTIPLAYER_MULTI_EVENT_START', syncID: body.lastId} as MultiplayerMultiEventStartAction));
        });
        for (const event of body.events) {
          let parsed: MultiplayerEvent;
          try {
            parsed = JSON.parse(event);
            if (!parsed.id) {
              throw new Error('MULTI_EVENT without ID: ' + parsed);
            }
          } catch (e) {
            console.error(e);
            continue;
          }

          // Sometimes we need to handle async actions - e.g. when calls to dispatch() return a promise in the inner routeEvent().
          // This constructs a chain of promises out of the calls to MULTI_EVENT so that async actions like fetchQuestXML are
          // allowed to complete before the next action is processed.
          // Actions are dispatched within a timeout so that react UI updates aren't blocked by
          // event routing.
          chain = chain.then((_: any) => {
            return new Promise<void>((fulfill, reject) => {
              setTimeout(() => {
                const route: any = dispatch(handleEvent(parsed, false, commitID, multiplayer)); // TODO: should buffered be set?
                if (route && typeof(route) === 'object' && route.then) {
                  fulfill(route);
                }
                fulfill();
              }, 0);
            });
          });
        }

        chain = chain.then((_: any) => {
          dispatch(local({type: 'MULTIPLAYER_MULTI_EVENT'}));
        });
        c.publish(e);
        return chain;
      case 'ERROR':
        console.error(JSON.stringify(body));
        break;
      default:
        console.error('UNKNOWN EVENT ' + (body as any).type);
        if (e.id) {
          dispatch(commit(e.id));
        }
    }
    c.publish(e);
    return Promise.resolve();
  };
}
