import * as React from 'react'
import Card from './base/Card'
import {SettingsType} from '../reducers/StateTypes'
import {DifficultyType} from '../reducers/QuestTypes'
import Picker from './base/Picker'
import Checkbox from './base/Checkbox'

export interface SettingsStateProps extends SettingsType {}

export interface SettingsDispatchProps {
  onShowHelpChange: (change: boolean) => void;
  onMultitouchChange: (change: boolean) => void;
  onVibrationChange: (change: boolean) => void;
  onPlayerDelta: (numPlayers: number, i: number) => void;
  onDifficultyDelta: (difficulty: DifficultyType, i: number) => void;
}

export interface SettingsProps extends SettingsStateProps, SettingsDispatchProps {};

const difficultyText: { [v: string]: any } = [
  {title: 'Easy', text: 'Enemies go easy on you.'},
  {title: 'Normal', text: 'Expedition as it was meant to be played. Adventurers start here!'},
  {title: 'Hard', text: 'Enemies are relentless; a true challenge for seasoned adventurers only.'},
  {title: 'Impossible', text: 'You will almost surely die, so make your death a glorious one!'}
];

const Settings = (props: SettingsProps): JSX.Element => {
  var difficultyIdx = ['EASY', 'NORMAL', 'HARD', 'IMPOSSIBLE'].indexOf(props.difficulty);

  var multitouchText = (props.multitouch) ? 'All players must hold their finger on the screen to end combat.' : 'A single player may tap the screen once to end combat.';
  var helpText = (props.showHelp) ? 'Setup and combat hints are shown.' : 'Setup and combat hints are hidden.';
  return (
    <Card title="Settings">

      <Picker label="Adventurers" value={props.numPlayers} onDelta={(i: number)=>props.onPlayerDelta(props.numPlayers, i)}>
        The number of players with Adventurer cards.
      </Picker>

      <Checkbox label="Multitouch" value={props.multitouch} onChange={props.onMultitouchChange}>
        {multitouchText}
      </Checkbox>

      <Picker label="Level" value={difficultyText[difficultyIdx].title} onDelta={(i: number)=>props.onDifficultyDelta(props.difficulty, i)}>
        {difficultyText[difficultyIdx].text}
      </Picker>

      <Checkbox label="Show Help" value={props.showHelp} onChange={props.onShowHelpChange}>
        {helpText}
      </Checkbox>

      <Checkbox label="Vibration" value={props.vibration} onChange={props.onVibrationChange}>
        Vibrate on touch
      </Checkbox>
    </Card>
  );
}

export default Settings;


