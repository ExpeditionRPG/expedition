import * as React from 'react';
import {UserState} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';
import Checkbox from '../base/Checkbox';
import Picker from '../base/Picker';
import TextDivider from '../base/TextDivider';

export interface StateProps {
  isLatestAppVersion: boolean;
  multitouch: boolean;
  numLocalPlayers: number;
  user: UserState;
}

export interface DispatchProps {
  onDelta: (numLocalPlayers: number, delta: number) => void;
  onLocalSelect: () => void;
  onMultiplayerSelect: (user: UserState) => void;
  onMultitouchChange: (change: boolean) => void;
}

interface Props extends StateProps, DispatchProps {}

const ModeSelect = (props: Props): JSX.Element => {
  return (
    <Card title="Game Setup">
      <Picker label="Players" onDelta={(i: number) => props.onDelta(props.numLocalPlayers, i)} value={props.numLocalPlayers}>
      {(props.numLocalPlayers > 1) ? 'The number of players.' : <div><strong>Solo play:</strong> Play as two adventurers with double the combat timer.</div>}
      </Picker>
      <Checkbox label="Multitouch" value={props.multitouch} onChange={props.onMultitouchChange}>
        {(props.multitouch) ? 'All players must hold their finger on the screen to end combat.' : 'A single tap will end combat.'}
      </Checkbox>
      <TextDivider text="Select Mode" />
      <Button onClick={() => props.onLocalSelect()}>
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
