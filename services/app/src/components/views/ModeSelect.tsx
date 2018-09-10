import * as React from 'react';
import {UserState} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';
import Picker from '../base/Picker';
import TextDivider from '../base/TextDivider';

export interface StateProps {
  numPlayers: number;
  user: UserState;
}

export interface DispatchProps {
  onDelta: (numPlayers: number, delta: number) => void;
  onLocalSelect: () => void;
  onMultiplayerSelect: (user: UserState) => void;
}

interface Props extends StateProps, DispatchProps {}

const ModeSelect = (props: Props): JSX.Element => {
  return (
    <Card title="Party Size">
      <Picker label="Adventurers" onDelta={(i: number) => props.onDelta(props.numPlayers, i)} value={props.numPlayers}>
        Set this to the number of players, then hit the Next button.
      </Picker>
      <TextDivider text="Select Mode" />
      <Button onClick={() => props.onLocalSelect()}>
        <div className="questButtonWithIcon">
          <div className="title">Local Game</div>
          <div className="summary">
            Play on one device.
          </div>
        </div>
      </Button>
      <Button id="selectOnlineMultiplayer" onClick={() => props.onMultiplayerSelect(props.user)}>
        <div className="questButtonWithIcon">
          <div className="title">Online Multiplayer - Beta</div>
          <div className="summary">
            {(!props.user || !props.user.loggedIn) ? 'Login and sync' : 'Sync'} your app with friends on another device.
          </div>
        </div>
      </Button>
    </Card>
  );
};

export default ModeSelect;
