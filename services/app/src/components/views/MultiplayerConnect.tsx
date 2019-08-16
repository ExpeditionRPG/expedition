import * as React from 'react';
import {SessionID} from 'shared/multiplayer/Session';
import {MultiplayerSessionMeta, MultiplayerState, UserState} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';

const Moment = require('moment');

export const MIN_SECRET_LENGTH = 4;

export interface StateProps {
  user: UserState;
  multiplayer: MultiplayerState;
}

export interface DispatchProps {
  onConnect: (user: UserState) => void;
  onReconnect: (user: UserState, id: SessionID, secret: string) => void;
  onNewSessionRequest: (user: UserState) => void;
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

export default MultiplayerConnect;
