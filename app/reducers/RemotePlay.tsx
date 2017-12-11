import Redux from 'redux'
import {RemotePlaySessionAction, RemotePlayHistoryAction, RemotePlayClientStatus} from '../actions/ActionTypes'
import {RemotePlayState} from './StateTypes'
import {Session} from 'expedition-qdl/lib/remote/Session'

export const initialRemotePlay: RemotePlayState = {
  session: null,
  history: [],
  syncing: false,
  clientStatus: {},
};

export function remotePlay(state: RemotePlayState = initialRemotePlay, action: Redux.Action|RemotePlaySessionAction): RemotePlayState {
  switch(action.type) {
    case 'REMOTE_PLAY_SESSION':
      const rpsa = (action as any) as RemotePlaySessionAction;
      return {...state, session: rpsa.session};
    case 'REMOTE_PLAY_HISTORY':
      const rph = (action as any) as RemotePlayHistoryAction;
      return {...state, history: rph.history || []};
    case 'INFLIGHT_REJECT':
      return {...state, syncing: true};
    case 'INFLIGHT_COMPACT':
      return {...state, syncing: false};
    case 'REMOTE_PLAY_CLIENT_STATUS':
      const rpcs = (action as any) as RemotePlayClientStatus;
      const newClientStatus = {...state.clientStatus}
      const k = rpcs.client+'|'+rpcs.instance;
      newClientStatus[k] = {...newClientStatus[k], ...rpcs.status};
      return {...state, clientStatus: newClientStatus};
    case 'REMOTE_PLAY_DISCONNECT':
      return initialRemotePlay;
    default:
      return state;
  }
}
