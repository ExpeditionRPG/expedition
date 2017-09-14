import * as React from 'react'
import Card from './base/Card'
import Button from './base/Button'
import {getAppVersion} from'../Globals'
import {SettingsType, CardState, UserState} from '../reducers/StateTypes'

export interface RemotePlayStateProps {
  card: CardState
}

export interface RemotePlayDispatchProps {
  onConnect: (secret: string) => void;
  onReconnect: (id: string) => void;
  onNewSessionRequest: () => void;
  onLockSession: () => void;
}

export interface RemotePlayProps extends RemotePlayStateProps, RemotePlayDispatchProps {}

function renderConnect(props: RemotePlayProps): JSX.Element {
  return (
    <Card title="Remote Play">
      <div>Lorem Ipsum Connect Here:</div>
      <input type="text"></input>
      <Button onTouchTap={() =>{props.onConnect('TEST')}}>Connect</Button>
      <Button onTouchTap={() =>{props.onNewSessionRequest()}}>Start a new Session</Button>
      <div>You may also reconnect to these active sessions:</div>
      <Button onTouchTap={() =>{props.onReconnect('TEST1')}}>Session 1</Button>
      <Button onTouchTap={() =>{props.onReconnect('TEST2')}}>Session 2</Button>
      <Button onTouchTap={() =>{props.onReconnect('TEST3')}}>Session 3</Button>
    </Card>
  );
}

function renderLobby(props: RemotePlayProps): JSX.Element {
  return (
    <Card title="Lobby">
      <div>Connected to Session: TODO</div>
      <div>
        <img src="static/icon/adventurer_small.svg"></img>
        <img src="static/icon/adventurer_small.svg"></img>
        <img src="static/icon/adventurer_small.svg"></img>
        <img src="static/icon/adventurer_small.svg"></img>
      </div>
      <div>Once all players are connected, do the lock thing!</div>
      <Button onTouchTap={() =>{props.onLockSession()}}>Lock it!</Button>
    </Card>
  );
}

const RemotePlay = (props: RemotePlayProps): JSX.Element => {
  switch(props.card.phase) {
    case 'CONNECT':
      return renderConnect(props);
    case 'LOBBY':
      return renderLobby(props);
    default:
      throw new Error('Unknown remote play phase ' + props.card.phase);
  }
}

export default RemotePlay;
