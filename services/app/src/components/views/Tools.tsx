import * as React from 'react';
import {SettingsType, UserState} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';

export interface StateProps {
  settings: SettingsType;
  user: UserState;
}

export interface DispatchProps {
  onCustomCombatSelect: (settings: SettingsType) => void;
  onPrivateQuestsSelect: (settings: SettingsType, user: UserState) => void;
}

export interface Props extends StateProps, DispatchProps {}

const Tools = (props: Props): JSX.Element => {
  return (
    <Card title="Tools">
      <Button id="selectCustomCombat" onClick={() => props.onCustomCombatSelect(props.settings)}>
        <div className="questButtonWithIcon">
          <div className="title">GM Mode</div>
          <div className="summary">You tell the story; the app runs the combat.</div>
        </div>
      </Button>
      <Button id="selectPrivateQuests" onClick={() => props.onPrivateQuestsSelect(props.settings, props.user)}>
        <div className="questButtonWithIcon">
          <div className="title">Private Quests</div>
          <div className="summary">View quests you've published privately with the Quest Creator (uses your current player count!)</div>
        </div>
      </Button>
      <p>(multiplayer moved to game mode select menu - double tap on the home screen to access)</p>
    </Card>
  );
};

export default Tools;
