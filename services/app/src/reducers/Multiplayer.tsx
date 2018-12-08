import Redux from 'redux';
import {MultiplayerClientStatus, MultiplayerConnectedAction, MultiplayerHistoryAction, MultiplayerMultiEventStartAction, MultiplayerSessionAction} from '../actions/ActionTypes';
import {MultiplayerState} from './StateTypes';

export const initialMultiplayer: MultiplayerState = {
  clientStatus: {},
  client: '',
  instance: '',
  history: [],
  session: null,
  syncing: false,
  multiEvent: false,
  syncID: 0,
  connected: false,
};

export function multiplayer(state: MultiplayerState = initialMultiplayer, action: Redux.Action|MultiplayerSessionAction): MultiplayerState {
  switch (action.type) {
    case 'MULTIPLAYER_SESSION':
      const rpsa = (action as any) as MultiplayerSessionAction;
      return {
        ...state,
        session: rpsa.session,
        client: rpsa.client,
        instance: rpsa.instance,
      };
    case 'MULTIPLAYER_HISTORY':
      const rph = (action as any) as MultiplayerHistoryAction;
      return {...state, history: rph.history || []};
    case 'MULTIPLAYER_SYNC':
    case 'MULTIPLAYER_REJECT':
      return {...state, syncing: true};
    case 'MULTIPLAYER_COMMIT':
      if (state.syncing && !state.multiEvent) {
        state.syncing = false;
      }
      return state;
    case 'MULTIPLAYER_MULTI_EVENT_START':
      return {...state, multiEvent: true, syncID: (action as MultiplayerMultiEventStartAction).syncID};
    case 'MULTIPLAYER_MULTI_EVENT':
      return {...state, multiEvent: false, syncing: false, syncID: 0};
    case 'MULTIPLAYER_CLIENT_STATUS':
      const rpcs = (action as any) as MultiplayerClientStatus;
      const newClientStatus = {...state.clientStatus};
      const k = rpcs.client + '|' + rpcs.instance;
      newClientStatus[k] = {...newClientStatus[k], ...rpcs.status};
      return {...state, clientStatus: newClientStatus};
    case 'MULTIPLAYER_CONNECTED':
      return {...state, connected: (action as MultiplayerConnectedAction).connected};
    case 'MULTIPLAYER_DISCONNECT':
      return initialMultiplayer;
    default:
      return state;
  }
}
