import Redux from 'redux'
import {RemotePlaySessionAction, RemotePlayHistoryAction} from '../actions/ActionTypes'
import {RemotePlayState} from './StateTypes'
import {Session} from 'expedition-qdl/lib/remote/Session'

export const initialRemotePlay: RemotePlayState = {
  session: null,
  history: [],
  syncing: false,
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
    default:
      return state;
  }
}
