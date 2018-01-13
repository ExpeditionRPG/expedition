import * as React from 'react'
import Close from 'material-ui/svg-icons/navigation/close'
import NetworkWifi from 'material-ui/svg-icons/device/network-wifi'
import SignalWifiOff from 'material-ui/svg-icons/device/signal-wifi-off'
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
  onConnect: (user: UserState) => void;
  onReconnect: (user: UserState, id: SessionID) => void;
  onNewSessionRequest: (user: UserState) => void;
  onContinue: () => void;
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
          {m.questTitle} ({(m.peerCount) ? m.peerCount-1 : 0} peers) - {Moment(m.lastAction).fromNow()}
        </Button>
      );
    });

    return (
      <Card title="Remote Play">
        <div className="remoteplay">
          <p>Remote play allows you to go on adventures with your friends, no matter where they are! Simply start a new session and have your friends join.</p>
          <Button onTouchTap={() =>{this.props.onNewSessionRequest(this.props.user)}}>Start a new session</Button>
          <Button onTouchTap={() =>{this.props.onConnect(this.props.user)}}>Join a session</Button>
          {history.length > 0 && <div className="helptext">You may also reconnect to these active sessions:</div>}
          {history}
          <br/>
          <p>You can have multiple people play off one device, with a maximum of 6 players across all devices. Each device / group will need a set of <a href="https://expeditiongame.com/store" target="_blank">Expedition cards</a> to play.</p>
        </div>
      </Card>
    );
  }
}

function renderLobby(props: RemotePlayProps): JSX.Element {
  return (
    <Card title="Lobby">
      <div className="remoteplay">
        <div><strong>Session created!</strong> Tell your peers to connect with the following code:</div>
        <h1 className="sessionCode">{props.remotePlay.session && props.remotePlay.session.secret}</h1>
        <p>The bottom bar indicates that you are in a remote play session:</p>
        <p>
          <img className="inline_icon" src="images/adventurer_small.svg" /> Peers connected (including yourself)<br/>
          <NetworkWifi/> / <SignalWifiOff/> Connection state<br/>
          <Close/> Exit remote play (others may continue to play)
        </p>
        <p>Once everyone is connected, click Start:</p>
        <Button remoteID="1" onTouchTap={() =>{props.onContinue()}}>Start</Button>
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
