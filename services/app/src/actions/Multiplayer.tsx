import Redux from 'redux';
import {MultiplayerEvent, MultiplayerEventBody, StatusEvent} from 'shared/multiplayer/Events';
import {toClientKey} from 'shared/multiplayer/Session';
import {handleFetchErrors} from 'shared/requests';
import {Expansion} from 'shared/schema/Constants';
import {openSnackbar} from '../actions/Snackbar';
import {populateScope} from '../components/views/quest/cardtemplates/Template';
import {ParserNode} from '../components/views/quest/cardtemplates/TemplateTypes';
import {MULTIPLAYER_SETTINGS, TransitionType} from '../Constants';
import {logEvent} from '../Logging';
import {ConnectionHandler, getMultiplayerConnection} from '../multiplayer/Connection';
import {getMultiplayerAction} from '../multiplayer/Remoteify';
import {AppStateWithHistory, MultiplayerSessionMeta, MultiplayerState, UserState} from '../reducers/StateTypes';
import {LocalAction, MultiplayerClientStatus, MultiplayerConnectedAction} from './ActionTypes';
import {toCard} from './Card';

export function local(a: Redux.Action): LocalAction {
  const inflight = (a as any)._inflight;
  return {type: 'LOCAL', action: a, _inflight: inflight} as any as LocalAction;
}

export function syncDispatch(dispatch: Redux.Dispatch<any>): Redux.Dispatch<any> {
  return (a: any) => {
    a._transition = TransitionType.instant;
    return dispatch(a);
  };
}

export function multiplayerDisconnect(c= getMultiplayerConnection()) {
  c.disconnect();
  return {type: 'MULTIPLAYER_DISCONNECT'};
}

function doConnect(user: UserState, secret: string, dispatch: Redux.Dispatch<any>, c= getMultiplayerConnection(), fetch: any = window.fetch) {
  let sessionID = '';
  const client = user.id.toString();
  const instance = Date.now().toString();
  return fetch(MULTIPLAYER_SETTINGS.connectURI, {
    body: JSON.stringify({instance, secret}),
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
    // This lets us navigate to the lobby, then immediately receive an update event
    dispatch({type: 'MULTIPLAYER_SESSION', session: {secret, id: sessionID}, client, instance});
    return dispatch(toCard({name: 'REMOTE_PLAY_LOBBY'}));
  })
  .then(() => {
    c.configure(client, instance);
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
      dispatch(toCard({name: 'REMOTE_PLAY_CONNECT'}));
    })
    .catch((error: Error) => {
      console.error(error);
      logEvent('multiplayer', 'init_err', {label: error.toString()});
      dispatch(toCard({name: 'REMOTE_PLAY_CONNECT'}));
    });
  };
}

export function setMultiplayerStatus(ev: StatusEvent, c= getMultiplayerConnection()) {
  return (dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): any => {
    const {multiplayer} = getState();
    if (!multiplayer) {
      return;
    }
    dispatch(sendStatus(undefined, undefined, ev, c));
    dispatch({
      client: multiplayer.client,
      instance: multiplayer.instance,
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
    dispatch(sendStatus(undefined, undefined, undefined, c));
    dispatch(openSnackbar(new Error('Was there a bug?'), true));
  };
}

export function sendStatus(client?: string, instance?: string, partialStatus?: StatusEvent, c= getMultiplayerConnection()) {
  return (dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): Promise<void> => {
    const {multiplayer, settings, commitID, quest, user} = getState();
    const elem = (quest && quest.node && quest.node.elem);
    const combat = (quest && quest.node && quest.node.ctx && quest.node.ctx.templates && quest.node.ctx.templates.combat);
    const selfStatus = (multiplayer && multiplayer.clientStatus && multiplayer.clientStatus[toClientKey(multiplayer.client, multiplayer.instance)]);
    const storeClient = multiplayer && multiplayer.client;
    const storeInstance = multiplayer && multiplayer.instance;
    client = client || storeClient;
    instance = instance || storeInstance;

    // Typically happens during initial setup, when the client and instance
    // have not yet been populated. In this case we're still setting up,
    // so it's OK to silently ignore this call.
    if (!client || !instance) {
      return Promise.resolve();
    }

    // Send remote if we're the origin
    if (client === storeClient && instance === storeInstance) {
      // Fill in local details if they aren't set from the partial status
      const event: StatusEvent = {
        connected: true,
        lastEventID: commitID,
        line: (elem && parseInt(elem.attr('data-line'), 10)) || undefined,
        numLocalPlayers: (settings && settings.numLocalPlayers) || 1,
        aliveAdventurers: (combat && combat.numAliveAdventurers),
        type: 'STATUS',
        waitingOn: (selfStatus && selfStatus.waitingOn),
        name: user && user.email,
        contentSets: settings && Object.keys(settings.contentSets || {}).filter((k: Expansion) => settings.contentSets[k]),
        ...(partialStatus || {}),
      };

      c.sendEvent(event, commitID);
      // Dispatch locally (and publish to event subscribers)
      dispatch({type: 'MULTIPLAYER_CLIENT_STATUS', client, instance, status: event});
      c.publish({id: null, client, instance, event});
    } else if (partialStatus !== undefined) {
      // Dispatch locally (and publish to event subscribers)
      dispatch({type: 'MULTIPLAYER_CLIENT_STATUS', client, instance, status: partialStatus});
      c.publish({id: null, client, instance, event: partialStatus});
    }
    return Promise.resolve();
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
  console.log('MULTIPLAYER_REJECT #' + n + ': ' + error);
  return {
    type: 'MULTIPLAYER_REJECT',
    id: n,
    error,
  };
}

export function handleEvent(e: MultiplayerEvent, buffered: boolean, commitID: number, multiplayer: MultiplayerState, c= getMultiplayerConnection(), regenScope= populateScope) {
  return (dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): Promise<void> => {
    console.log(e);
    const body = e.event;
    switch (body.type) {
      case 'STATUS':
        if (e.client !== multiplayer.client || e.instance !== multiplayer.instance) {
          return dispatch(sendStatus(e.client, e.instance, body, c));
        }
        break;
      case 'INTERACTION':
        // Interaction events are not dispatched; UI element subscribers pick up the event on publish().
        break;
      case 'ACTION':
        // Actions must have IDs.
        if (e.id === null) {
          return Promise.resolve();
        }

        // Ignore actions from the past.
        if (e.id && e.id <= (commitID)) {
          console.log('Ignoring prior action #' + e.id + ' ' + e.event.type + '(counter at #' + commitID + ')');
          return Promise.resolve();
        }

        if (e.id && e.id !== (commitID + 1)) {
          // If we don't receive the immediate next action, we're fast-forwarding to
          // a future state.
          // TODO: Change animation so it doesn't look like a simple "next" action
          console.log('Received out-of-sync #' + e.id + ' ' + e.event.type + ' (counter at #' + commitID + '), using sync animation');
          dispatch = syncDispatch(dispatch);
        }

        // If the server is describing an event and we have a similar message buffered,
        // cancel the buffered event in favor of the server's opinion.
        // This can happen in edge cases, e.g. client sends event A, connection flaps,
        // server responds to client status with a different event A.
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

        // Set a "remote" marker so we can handle it differently than local actions
        const args = JSON.parse(body.args);
        if (body.ctx !== null && body.line !== null) {
          // We have enough details to reconstruct the remote node before acting
          const elem = getState().quest.node.elem.parentsUntil().find(`[data-line=${body.line}]`);
          if (!elem) {
            throw new Error(`Could not load line ${body.line} for multiplayer action`);
          }

          // Functions do not get serialized; we must recreate them.
          body.ctx.scope._ = regenScope();

          args.node = new ParserNode(elem, body.ctx, undefined, body.ctx.seed);
        }
        console.log(`WS: Inbound #${e.id}: fn ${args.name}`, args);
        const action = a(args);
        (action as any)._inflight = 'remote';

        let result: any;
        try {
          result = dispatch(action);
        } finally {
          if (e.id !== null) {
            dispatch(commit(e.id));
          }
        }
        return result;
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
