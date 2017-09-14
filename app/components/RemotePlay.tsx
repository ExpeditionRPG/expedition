import * as React from 'react'
import Card from './base/Card'
import Button from './base/Button'
import {getAppVersion} from'../Globals'
import {SettingsType, CardState, UserState, RemotePlayPhase} from '../reducers/StateTypes'

export interface RemotePlayStateProps {
  phase: RemotePlayPhase;
  user: UserState;
}

export interface RemotePlayDispatchProps {
  onConnect: (user: UserState, secret: string) => void;
  onReconnect: (user: UserState, id: string) => void;
  onNewSessionRequest: (user: UserState) => void;
  onLockSession: () => void;
}

export interface RemotePlayProps extends RemotePlayStateProps, RemotePlayDispatchProps {}

class RemotePlayConnect extends React.Component<RemotePlayProps, {}> {
  state: {secret: string};

  constructor(props: RemotePlayProps) {
    super(props)
    this.state = {secret: ''};
  }

  handleSecret(e: any) {
    const v: string = e.target.value;
    if (v.length > 4) {
      return;
    }

    this.setState({secret: v.toUpperCase()});
  }

  render() {
    return (
      <Card title="Remote Play">
        <div className="remoteplay">
          <div className="helptext">Lorem Ipsum Connect Here:</div>
          <input type="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} onChange={(e: any) => {this.handleSecret(e)}} value={this.state.secret}></input>
          <Button onTouchTap={() =>{this.props.onConnect(this.props.user, this.state.secret)}}>Connect</Button>
          <Button onTouchTap={() =>{this.props.onNewSessionRequest(this.props.user)}}>Start a new Session</Button>
          <div className="helptext">You may also reconnect to these active sessions:</div>
          <Button onTouchTap={() =>{this.props.onReconnect(this.props.user, 'TEST1')}}>Session 1</Button>
          <Button onTouchTap={() =>{this.props.onReconnect(this.props.user, 'TEST2')}}>Session 2</Button>
          <Button onTouchTap={() =>{this.props.onReconnect(this.props.user, 'TEST3')}}>Session 3</Button>
        </div>
      </Card>
    );
  }
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
  switch(props.phase) {
    case 'CONNECT':
      return <RemotePlayConnect {...props} />;
    case 'LOBBY':
      return renderLobby(props);
    default:
      throw new Error('Unknown remote play phase ' + props.phase);
  }
}

export default RemotePlay;
