import Redux from 'redux'
import {MultiplayerSessionAction, MultiplayerHistoryAction, MultiplayerClientStatus} from '../actions/ActionTypes'
import {MultiplayerState} from './StateTypes'

export const initialMultiplayer: MultiplayerState = {
  history: [],
  syncing: false,
  clientStatus: {},
  session: null,
};

export function multiplayer(state: MultiplayerState = initialMultiplayer, action: Redux.Action|MultiplayerSessionAction): MultiplayerState {
  switch(action.type) {
    case 'MULTIPLAYER_SESSION':
      const rpsa = (action as any) as MultiplayerSessionAction;
      return {...state, session: rpsa.session};
    case 'MULTIPLAYER_HISTORY':
      const rph = (action as any) as MultiplayerHistoryAction;
      return {...state, history: rph.history || []};
    case 'INFLIGHT_REJECT':
      return {...state, syncing: true};
    case 'INFLIGHT_COMPACT':
      return {...state, syncing: false};
    case 'MULTIPLAYER_CLIENT_STATUS':
      const rpcs = (action as any) as MultiplayerClientStatus;
      const newClientStatus = {...state.clientStatus}
      const k = rpcs.client+'|'+rpcs.instance;
      newClientStatus[k] = {...newClientStatus[k], ...rpcs.status};
      return {...state, clientStatus: newClientStatus};
    case 'MULTIPLAYER_DISCONNECT':
      return initialMultiplayer;
    default:
      return state;
  }
}
