import * as React from 'react'
import Close from 'material-ui/svg-icons/navigation/close'
import NetworkWifi from 'material-ui/svg-icons/device/network-wifi'
import SignalWifiOff from 'material-ui/svg-icons/device/signal-wifi-off'
import Card from '../base/Card'
import Button from '../base/Button'
import {SessionID} from 'expedition-qdl/lib/multiplayer/Session'
import {UserState, MultiplayerPhase, MultiplayerState, MultiplayerSessionMeta} from '../../reducers/StateTypes'

const Moment = require('moment');

export const MIN_SECRET_LENGTH = 4;

export interface MultiplayerStateProps {
  phase: MultiplayerPhase;
  user: UserState;
  remotePlay: MultiplayerState;
}

export interface MultiplayerDispatchProps {
  onConnect: (user: UserState) => void;
  onReconnect: (user: UserState, id: SessionID, secret: string) => void;
  onNewSessionRequest: (user: UserState) => void;
  onContinue: () => void;
}

export interface MultiplayerProps extends MultiplayerStateProps, MultiplayerDispatchProps {}

class MultiplayerConnect extends React.Component<MultiplayerProps, {}> {
  state: {secret: string};

  constructor(props: MultiplayerProps) {
    super(props)
    this.state = {secret: ''};
  }

  handleSecret(e: any) {
    const v: string = e.target.value;
    if (v.length > MIN_SECRET_LENGTH) {
      return;
    }

    this.setState({secret: v.toUpperCase()});
  }

  render() {
    const history = this.props.remotePlay.history.map((m: MultiplayerSessionMeta, i: number) => {
      return (
        <Button key={i} onTouchTap={()=>{this.props.onReconnect(this.props.user, m.id, m.secret)}}>
          {m.questTitle} ({m.peerCount || 0} peers) - {Moment(m.lastAction).fromNow()}
        </Button>
      );
    });

    return (
      <Card title="Online Multiplayer">
        <div className="remoteplay">
          <p>Online multiplayer allows you to go on adventures with your friends, no matter where they are! Simply start a new session and have your friends join.</p>
          <Button onTouchTap={() =>{this.props.onNewSessionRequest(this.props.user)}}>Start a new session</Button>
          <Button onTouchTap={() =>{this.props.onConnect(this.props.user)}}>Join a session</Button>
          {history.length > 0 && <div className="helptext">You may also reconnect to these sessions:</div>}
          {history}
          <br/>
          <p>You can have multiple people play off one device, with a maximum of 6 players across all devices. Each device / group will need a set of <a href="#" onClick={() => window.open('https://expeditiongame.com/store?utm_source=app', '_blank')}>Expedition cards</a> to play.</p>
        </div>
      </Card>
    );
  }
}

function renderLobby(props: MultiplayerProps): JSX.Element {
  return (
    <Card title="Lobby">
      <div className="remoteplay">
        <div><strong>Session created!</strong> Tell your peers to connect with the following code:</div>
        <h1 className="sessionCode">{props.remotePlay.session && props.remotePlay.session.secret}</h1>
        <p>The bottom bar indicates that you are in an online multiplayer session:</p>
        <p>
          <img className="inline_icon" src="images/adventurer_small.svg" /> Peers connected (including yourself)<br/>
          <NetworkWifi/> / <SignalWifiOff/> Connection state<br/>
          <Close/> Exit multiplayer (others may continue to play)
        </p>
        <p>Once everyone is connected, click Start:</p>
        <Button remoteID="1" onTouchTap={() =>{props.onContinue()}}>Start</Button>
      </div>
    </Card>
  );
}

const Multiplayer = (props: MultiplayerProps): JSX.Element => {
  switch(props.phase) {
    case 'CONNECT':
      return <MultiplayerConnect {...props} />;
    case 'LOBBY':
      return renderLobby(props);
    default:
      throw new Error('Unknown multiplayer phase ' + props.phase);
  }
}

export default Multiplayer;
