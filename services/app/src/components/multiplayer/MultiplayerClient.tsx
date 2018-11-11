import * as React from 'react';
import {MultiplayerEvent, StatusEvent} from 'shared/multiplayer/Events';
import {ConnectionHandler} from '../../multiplayer/Connection';
import {MultiplayerState} from '../../reducers/StateTypes';

const STATUS_MS = 5000;

export interface StateProps {
  commitID: number;
  multiplayer: MultiplayerState;
}

export interface DispatchProps {
  onStatus: (client?: string, instance?: string, status?: StatusEvent) => void;
  onEvent: (e: MultiplayerEvent, buffered: boolean, commitID: number, multiplayer: MultiplayerState) => void;
  onReject: (n: number, error: string) => any;
  onConnectionChange: (connected: boolean) => void;
  onRegisterHandler: (handler: ConnectionHandler) => void;
}

export interface Props extends StateProps, DispatchProps {}

export default class MultiplayerClient extends React.Component<Props, {}> {
  private intervalHandler: number;

  constructor(props: Props) {
    super(props);
    this.props.onRegisterHandler(this);

    this.intervalHandler = setInterval(() => {
      // We send a periodic status to the server to keep it advised
      // of our connection and event ID state.
      if (this.props.multiplayer.connected) {
        this.props.onStatus();
      }
    }, STATUS_MS);
  }

  public onReject(n: number, error: string) {
    this.props.onReject(n, error);
  }

  public onEvent(e: MultiplayerEvent, buffered: boolean) {
    this.props.onEvent(e, buffered, this.props.commitID, this.props.multiplayer);
  }

  public onConnectionChange(connected: boolean) {
    this.props.onConnectionChange(connected);
    if (connected) {
      this.props.onStatus();
    }
  }

  public componentWillUnmount() {
    clearInterval(this.intervalHandler);
  }

  public render(): JSX.Element|null {
    return null;
  }
}
