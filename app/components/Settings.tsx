import * as React from 'react'
import Card from './base/Card'
import {DifficultyType, FontSizeType, SettingsType} from '../reducers/StateTypes'
import Picker from './base/Picker'
import Checkbox from './base/Checkbox'

export interface SettingsStateProps extends SettingsType {}

export interface SettingsDispatchProps {
  onAutoRollChange: (change: boolean) => void;
  onDifficultyDelta: (difficulty: DifficultyType, i: number) => void;
  onFontSizeDelta: (idx: number, delta: number) => void;
  onMultitouchChange: (change: boolean) => void;
  onPlayerDelta: (numPlayers: number, i: number) => void;
  onShowHelpChange: (change: boolean) => void;
  onTimerSecondsDelta: (idx: number, delta: number) => void;
  onVibrationChange: (change: boolean) => void;
}

export interface SettingsProps extends SettingsStateProps, SettingsDispatchProps {};

// For all cycles, going to the right = harder, left = easier
const difficultyText: { [v: string]: any } = [
  {title: 'Easy', text: 'Enemies go easy on you.'},
  {title: 'Normal', text: 'Expedition as it was meant to be played. Adventurers start here!'},
  {title: 'Hard', text: 'Enemies are relentless; a true challenge for seasoned adventurers only.'},
  {title: 'Impossible', text: 'You will almost surely die, so make your death a glorious one!'},
];

export const fontSizeValues: FontSizeType[] = ['SMALL', 'NORMAL', 'LARGE'];

const timerText: { [v: string]: any } = [
  {title: 'Disabled', text: 'Timer disabled.' },
  {title: 'Strategic', text: 'Time to plan, 30 seconds per round.' },
  {title: 'Relaxed', text: 'Breathing room, 15 seconds per round.' },
  {title: 'Normal', text: 'Classic Expedition, 10 seconds per round.' },
  {title: 'Fast', text: 'Act fast! 6 seconds per round.' },
];
export const timerValues: number[] = [null, 30, 15, 10, 6];

const Settings = (props: SettingsProps): JSX.Element => {
  const difficultyIdx = ['EASY', 'NORMAL', 'HARD', 'IMPOSSIBLE'].indexOf(props.difficulty);
  const fontSizeIdx = fontSizeValues.indexOf(props.fontSize);
  const timerIdx = timerValues.indexOf(props.timerSeconds);

  const multitouchText = (props.multitouch) ? 'All players must hold their finger on the screen to end combat.' : 'A single tap will end combat.';
  const helpText = (props.showHelp) ? 'Setup and combat hints are shown.' : 'Setup and combat hints are hidden.';
  const playerText = (props.numPlayers > 1) ? 'The number of players.' : 'Solo play: Play as two adventurers, and get twice as long to play in combat.';
  return (
    <Card title="Settings">

      <Picker label="Adventurers" value={props.numPlayers} onDelta={(i: number)=>props.onPlayerDelta(props.numPlayers, i)}>
        {playerText}
      </Picker>

      <Checkbox label="Multitouch" value={props.multitouch} onChange={props.onMultitouchChange}>
        {multitouchText}
      </Checkbox>

      <Picker label="Level" value={difficultyText[difficultyIdx].title} onDelta={(i: number)=>props.onDifficultyDelta(props.difficulty, i)}>
        {difficultyText[difficultyIdx].text}
      </Picker>

      <Picker label="Timer" value={timerText[timerIdx].title} onDelta={(i: number)=>props.onTimerSecondsDelta(timerIdx, i)}>
        {timerText[timerIdx].text}
      </Picker>

      <Checkbox label="Show Help" value={props.showHelp} onChange={props.onShowHelpChange}>
        {helpText}
      </Checkbox>

      <Checkbox label="Vibration" value={props.vibration} onChange={props.onVibrationChange}>
        Vibrate on touch
      </Checkbox>

      <Checkbox label="Auto-Roll" value={props.autoRoll} onChange={props.onAutoRollChange}>
        Automatically roll for the party when resolving combat.
      </Checkbox>

      <Picker label="Font Size" value={fontSizeValues[fontSizeIdx]} onDelta={(i: number)=>props.onFontSizeDelta(fontSizeIdx, i)}>
        Takes effect once you leave settings.
      </Picker>
    </Card>
  );
}

export default Settings;


