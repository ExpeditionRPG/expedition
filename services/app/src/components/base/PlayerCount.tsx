import * as React from 'react';
import {MAX_ADVENTURERS} from '../../Constants';
import Picker from './Picker';

export interface Props extends React.Props<any> {
  allPlayers: number;
  localPlayers: number;
  id?: string;
  onChange: (localPlayers: number) => any;
}

export default class PlayerCount extends React.Component<Props, {}> {
  private onDelta(delta: number) {
    if (delta > 0 && this.props.allPlayers + delta > MAX_ADVENTURERS) {
      return;
    }
    if (delta < 0 && this.props.localPlayers + delta < 1) {
      return;
    }
    this.props.onChange(this.props.localPlayers + delta);
  }

  public render() {
    return (
      <Picker id={this.props.id} label="Players" value={this.props.localPlayers} onDelta={(i: number) => this.onDelta(i)}>
        {(this.props.allPlayers > 1) ? 'The number of players.' : <div><strong>Solo play:</strong> Play as two adventurers with double the timer.</div>}
        {(this.props.allPlayers > this.props.localPlayers) && <div>({this.props.allPlayers} across all devices)</div>}
      </Picker>
    );
  }
}
