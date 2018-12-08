import {numPlayers} from 'app/actions/Settings';
import * as React from 'react';
import {MultiplayerState, SettingsType, UserState} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';
import Checkbox from '../base/Checkbox';
import PlayerCount from '../base/PlayerCount';
import TextDivider from '../base/TextDivider';

export interface StateProps {
  isLatestAppVersion: boolean;
  settings: SettingsType;
  multiplayer: MultiplayerState;
  user: UserState;
}

export interface DispatchProps {
  onPlayerChange: (numLocalPlayers: number) => void;
  onLocalSelect: () => void;
  onMultiplayerSelect: (user: UserState) => void;
  onMultitouchChange: (change: boolean) => void;
}

export interface Props extends StateProps, DispatchProps {}

const ModeSelect = (props: Props): JSX.Element => {
  const allPlayers = numPlayers(props.settings, props.multiplayer);
  return (
    <Card title="Game Setup">
      <PlayerCount id="playerCount" onChange={(i: number) => props.onPlayerChange(i)} localPlayers={props.settings.numLocalPlayers} allPlayers={allPlayers}/>
      <Checkbox id="multitouch" label="Multitouch" value={props.settings.multitouch} onChange={props.onMultitouchChange}>
        {(props.settings.multitouch) ? 'All players must hold their finger on the screen to end combat.' : 'A single tap will end combat.'}
      </Checkbox>
      <TextDivider text="Select Mode" />
      <Button id="selectLocal" onClick={() => props.onLocalSelect()}>
        <div className="questButtonWithIcon">
          <div className="title">Local Game</div>
          <div className="summary">
            Play on one device.
          </div>
        </div>
      </Button>
      <Button id="selectOnlineMultiplayer"
        disabled={!props.isLatestAppVersion}
        onClick={() => props.onMultiplayerSelect(props.user)}
      >
        <div className="questButtonWithIcon">
          <div className="title">Online Multiplayer</div>
          {props.isLatestAppVersion && <div className="summary">
            {(!props.user || !props.user.loggedIn) ? 'Login and sync' : 'Sync'} your app with friends on another device.
          </div>}
          {!props.isLatestAppVersion && <div className="summary">
            Disabled: Please update your app to the latest version or use the web app at app.expeditiongame.com.
          </div>}
        </div>
      </Button>
    </Card>
  );
};

export default ModeSelect;
