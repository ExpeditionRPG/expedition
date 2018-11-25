import Close from '@material-ui/icons/Close';
import NetworkWifi from '@material-ui/icons/NetworkWifi';
import SignalWifiOff from '@material-ui/icons/SignalWifiOff';
import * as React from 'react';
import {SessionID} from 'shared/multiplayer/Session';
import {CONTENT_SET_FULL_NAMES} from '../../Constants';
import {MultiplayerPhase, MultiplayerSessionMeta, MultiplayerState, UserState} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';

const Moment = require('moment');

export const MIN_SECRET_LENGTH = 4;

export interface StateProps {
  phase: MultiplayerPhase;
  user: UserState;
  multiplayer: MultiplayerState;
}

export interface DispatchProps {
  onConnect: (user: UserState) => void;
  onReconnect: (user: UserState, id: SessionID, secret: string) => void;
  onNewSessionRequest: (user: UserState) => void;
  onStart: () => void;
}

export interface Props extends StateProps, DispatchProps {}

class MultiplayerConnect extends React.Component<Props, {}> {
  public state: {secret: string};

  constructor(props: Props) {
    super(props);
    this.state = {secret: ''};
  }

  public handleSecret(e: any) {
    const v: string = e.target.value;
    if (v.length > MIN_SECRET_LENGTH) {
      return;
    }

    this.setState({secret: v.toUpperCase()});
  }

  public render() {
    const history = this.props.multiplayer.history.map((m: MultiplayerSessionMeta, i: number) => {
      return (
        <Button key={i} onClick={() => {this.props.onReconnect(this.props.user, m.id, m.secret); }}>
          {m.questTitle} ({m.peerCount || 0} peers) - {Moment(m.lastAction).fromNow()}
        </Button>
      );
    });

    return (
      <Card title="Online Multiplayer">
        <div className="remoteplay">
          <p>Adventure with your friends, no matter where they are!</p>
          <ul>
            <li>Multiple players can play on one device</li>
            <li>Up to 6 players can play in a session</li>
            <li>Each device needs <a href="#" onClick={() => window.open('https://expeditiongame.com/store?utm_source=app', '_blank')}>Expedition</a> to play.</li>
            <li>If you are using an older device or encounter performance issues, please use a separate device for communication.</li>
          </ul>
          <p>Start a new session, or join an existing one:</p>
          <Button onClick={() => {this.props.onNewSessionRequest(this.props.user); }}>Start a new session</Button>
          <Button onClick={() => {this.props.onConnect(this.props.user); }}>Join a session</Button>
          {history.length > 0 && <div className="helptext">You may also reconnect to these sessions:</div>}
          {history}
        </div>
      </Card>
    );
  }
}

// Get the content sets supported by all connected devices.
function getContentSetIntersection(multiplayer: MultiplayerState): string[] {
  let result: Set<string>|null = null;
  const clients = multiplayer.clientStatus;
  Object.keys(clients).map((k) => {
    if (!clients[k].connected) {
      return;
    }

    const contentSets = new Set(clients[k].contentSets);
    if (!result) {
      result = contentSets;
      return;
    }
    result = new Set([...result].filter((c) => contentSets.has(c)));
  });
  return ['base', ...(result || [])];
}

// TODO: Put this in a separate file and move the switch statemenet to Compositor
export function renderLobby(props: Props): JSX.Element {
  return (
    <Card title="Lobby">
      <div className="remoteplay">
        <h2>Multiplayer Session</h2>
        <div>Tell your friends to connect with the following code:</div>
        <h1 className="sessionCode">{props.multiplayer.session && props.multiplayer.session.secret}</h1>
        <h2>Content Sets</h2>
        <p>These are the content sets that every device has:</p>
        <ul id='contentsets'>
          {getContentSetIntersection(props.multiplayer).map((c: string, i) => {
            const fullName: string = CONTENT_SET_FULL_NAMES[c] || c;
            return <li key={i}>{fullName}</li>;
          })}
        </ul>
        <h2>Quick Tips</h2>
        <p>The bottom bar indicates that you are in an online multiplayer session:</p>
        <table>
          <tbody>
            <tr><td><img className="inline_icon" src="images/adventurer_small.svg" /></td><td>
              <span>Connected adventurers</span>
              <span>(each device has a different color)</span>
            </td></tr>
            <tr><td><NetworkWifi/> / <SignalWifiOff/></td><td>
              <span>Connection state</span>
            </td></tr>
            <tr><td><Close/></td><td>
              <span>Exit multiplayer</span>
              <span>(others may continue to play)</span>
            </td></tr>
          </tbody>
        </table>
        <p>Click the connected adventurers or connection state for more information.</p>
        <p>Once everyone is connected, click Start:</p>
        <Button id="start" className="mediumbutton" onClick={() => {props.onStart(); }}>Start</Button>
      </div>
    </Card>
  );
}

const Multiplayer = (props: Props): JSX.Element => {
  switch (props.phase) {
    case 'CONNECT':
      return <MultiplayerConnect {...props} />;
    case 'LOBBY':
      return renderLobby(props);
    default:
      throw new Error('Unknown multiplayer phase ' + props.phase);
  }
};

export default Multiplayer;
