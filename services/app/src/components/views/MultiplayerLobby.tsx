import Close from '@material-ui/icons/Close';
import NetworkWifi from '@material-ui/icons/NetworkWifi';
import SignalWifiOff from '@material-ui/icons/SignalWifiOff';
import * as React from 'react';
import {CONTENT_SET_FULL_NAMES, Expansion} from 'shared/schema/Constants';
import {numPlayers} from '../../actions/Settings';
import {MAX_ADVENTURERS} from '../../Constants';
import {ContentSetsType, MultiplayerState, SettingsType} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';
import PlayerCount from '../base/PlayerCount';

export const MIN_SECRET_LENGTH = 4;

export interface StateProps {
  multiplayer: MultiplayerState;
  settings: SettingsType;
  contentSets: Set<keyof ContentSetsType>;
}

export interface DispatchProps {
  onStart: () => void;
  onPlayerChange: (localPlayers: number) => void;
}

export interface Props extends StateProps, DispatchProps {}

// TODO: Put this in a separate file and move the switch statemenet to Compositor
const MultiplayerLobby = (props: Props): JSX.Element => {
  const allPlayers = numPlayers(props.settings, props.multiplayer);
  return (
    <Card title="Lobby">
      <div className="remoteplay">
        <h2>Multiplayer Session</h2>
        <div>Tell your friends to connect with the following code:</div>
        <h1 className="sessionCode">{props.multiplayer.session && props.multiplayer.session.secret}</h1>
        <h2>Content Sets</h2>
        <p>These are the content sets that every device has, and thus will be enabled in the session:</p>
        <ul id="contentsets">
          {[...props.contentSets].map((c: Expansion, i: number) => {
            return <li key={i}>{CONTENT_SET_FULL_NAMES[c] || c}</li>;
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
        <h2>Adventurers</h2>
        <p>Max of {MAX_ADVENTURERS} players allowed in multiplayer.</p>
        <PlayerCount id="playerCount" localPlayers={props.settings.numLocalPlayers} allPlayers={allPlayers} onChange={(localPlayers: number) => props.onPlayerChange(localPlayers)} />
        <br/>
        <p>Once everyone is ready, click Start:</p>
        <Button id="start" className="mediumbutton" disabled={allPlayers > MAX_ADVENTURERS} onClick={() => {props.onStart(); }}>{(allPlayers > MAX_ADVENTURERS) ? `Player count must be ≤ ${MAX_ADVENTURERS}` : 'Start'}</Button>
      </div>
    </Card>
  );
};

export default MultiplayerLobby;
