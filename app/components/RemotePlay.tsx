import * as React from 'react'
import Card from './base/Card'
import Button from './base/Button'
import {getAppVersion} from'../Globals'
import {SessionID, SessionSecret, SessionMetadata} from 'expedition-qdl/lib/remote/Session'
import {SettingsType, CardState, UserState, RemotePlayPhase, RemotePlayState} from '../reducers/StateTypes'

const Moment = require('moment');

export interface RemotePlayStateProps {
  phase: RemotePlayPhase;
  user: UserState;
  remotePlay: RemotePlayState;
}

export interface RemotePlayDispatchProps {
  onConnect: (user: UserState, secret: SessionSecret) => void;
  onReconnect: (user: UserState, id: SessionID) => void;
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
    const history = this.props.remotePlay.history.map((m: SessionMetadata, i: number) => {
      return (
        <Button key={i} onTouchTap={()=>{this.props.onReconnect(this.props.user, m.id)}}>
          {m.questTitle} ({m.peerCount-1} peers) - {Moment(m.lastAction).fromNow()}
        </Button>
      );
    });

    return (
      <Card title="Remote Play">
        <div className="remoteplay">
          <div className="helptext">Lorem Ipsum Connect Here:</div>
          <input type="text" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} onChange={(e: any) => {this.handleSecret(e)}} value={this.state.secret}></input>
          <Button onTouchTap={() =>{this.props.onConnect(this.props.user, this.state.secret)}}>Connect</Button>
          <Button onTouchTap={() =>{this.props.onNewSessionRequest(this.props.user)}}>Start a new Session</Button>
          <div className="helptext">You may also reconnect to these active sessions:</div>
          {history}
        </div>
      </Card>
    );
  }
}

function renderLobby(props: RemotePlayProps): JSX.Element {
  return (
    <Card title="Lobby">
      <div className="remoteplay">
        <div>Connected to Session!</div>
        <div>Session secret: {props.remotePlay.session && props.remotePlay.session.secret}</div>
        <div className="connect_bar">
          <img src="images/adventurer_small.svg"></img>
          <img src="images/adventurer_small.svg"></img>
          <img src="images/adventurer_small.svg"></img>
          <img src="images/adventurer_small.svg"></img>
        </div>
        <div>Once all players are connected, do the lock thing!</div>
        <Button onTouchTap={() =>{props.onLockSession()}}>Lock it!</Button>
      </div>
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
