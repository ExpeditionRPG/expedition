import Button from '@material-ui/core/Button';
import * as React from 'react';
import {DifficultyType, FontSizeType, SettingsType} from '../../reducers/StateTypes';
import Card from '../base/Card';
import Checkbox from '../base/Checkbox';
import Picker from '../base/Picker';

export interface StateProps extends SettingsType {}

export interface DispatchProps {
  onAudioChange: (change: boolean) => void;
  onAutoRollChange: (change: boolean) => void;
  onDifficultyDelta: (difficulty: DifficultyType, i: number) => void;
  onExpansionSelect: () => void;
  onExperimentalChange: (change: boolean) => void;
  onFontSizeDelta: (idx: number, delta: number) => void;
  onMultitouchChange: (change: boolean) => void;
  onPlayerDelta: (numPlayers: number, i: number) => void;
  onShowHelpChange: (change: boolean) => void;
  onTimerSecondsDelta: (idx: number, delta: number) => void;
  onVibrationChange: (change: boolean) => void;
}

export interface Props extends StateProps, DispatchProps {}

// For all cycles, going to the right = harder, left = easier
const difficultyText: { [v: string]: any } = [
  {title: 'Story', text: 'You\'re here for the story. Enemies go easy on you.'},
  {title: 'Normal', text: 'Expedition as it was meant to be played. Adventurers start here!'},
  {title: 'Hard', text: 'Enemies are relentless; a true challenge for seasoned adventurers only.'},
  {title: 'Impossible', text: 'You will almost surely die, so make your death a glorious one!'},
];
const difficultyValues: string[] = ['EASY', 'NORMAL', 'HARD', 'IMPOSSIBLE'];

export const fontSizeValues: FontSizeType[] = ['SMALL', 'NORMAL', 'LARGE'];

const timerText: { [v: string]: any } = [
  {title: 'Disabled', text: 'Timer disabled.' },
  {title: 'Strategic', text: 'Time to plan, 30 seconds per round.' },
  {title: 'Relaxed', text: 'Breathing room, 15 seconds per round.' },
  {title: 'Normal', text: 'Classic Expedition, 10 seconds per round.' },
  {title: 'Fast', text: 'Act fast! 6 seconds per round.' },
];
export const timerValues: Array<number|null> = [null, 30, 15, 10, 6];

const Settings = (props: Props): JSX.Element => {
  const difficultyIdx = difficultyValues.indexOf(props.difficulty);
  const fontSizeIdx = fontSizeValues.indexOf(props.fontSize);
  const timerIdx = props.timerSeconds ? timerValues.indexOf(props.timerSeconds) : 0;

  return (
    <Card title="Settings">
      <Button className="primary large" onClick={() => props.onExpansionSelect()}>Choose game / expansion</Button>
      <p className="expansionLabel">Currently playing: {props.contentSets.horror ? <strong>Expedition + Horror</strong> : <strong>Expedition Base</strong>}</p>

      <Picker label="Adventurers" value={props.numPlayers} onDelta={(i: number) => props.onPlayerDelta(props.numPlayers, i)}>
        {(props.numPlayers > 1) ? 'The number of players.' : <div><strong>Solo play:</strong> Play as two adventurers with double the combat timer.</div>}
      </Picker>

      <Checkbox label="Multitouch" value={props.multitouch} onChange={props.onMultitouchChange}>
        {(props.multitouch) ? 'All players must hold their finger on the screen to end combat.' : 'A single tap will end combat.'}
      </Checkbox>

      <Picker label="Difficulty" value={difficultyText[difficultyIdx].title} onDelta={(i: number) => props.onDifficultyDelta(props.difficulty, i)}>
        {difficultyText[difficultyIdx].text}
      </Picker>

      <Picker label="Timer" value={timerText[timerIdx].title} onDelta={(i: number) => props.onTimerSecondsDelta(timerIdx, i)}>
        <div>
          {timerText[timerIdx].text}
          {props.numPlayers === 1 ? <span><br/><strong>Solo play:</strong> Timers are doubled.</span> : ''}
        </div>
      </Picker>

      <Checkbox label="Sound" value={props.audioEnabled} onChange={props.onAudioChange}>
        {(props.audioEnabled) ? 'Music and sound effects enabled.' : 'Music and sound effects disabled.'}
      </Checkbox>

      <Checkbox label="Show Help" value={props.showHelp} onChange={props.onShowHelpChange}>
        {(props.showHelp) ? 'Setup and combat hints are shown.' : 'Setup and combat hints are hidden.'}
      </Checkbox>

      <Checkbox label="Vibration" value={props.vibration} onChange={props.onVibrationChange}>
        {(props.vibration) ? 'Vibrate on touch.' : 'Do not vibrate.'}
      </Checkbox>

      <Checkbox label="Auto-Roll" value={props.autoRoll} onChange={props.onAutoRollChange}>
        {(props.autoRoll) ? 'Automatically roll for the party when resolving combat.' : 'Do not show pre-generated rolls in combat.'}
      </Checkbox>

      <Picker label="Font Size" value={fontSizeValues[fontSizeIdx]} onDelta={(i: number) => props.onFontSizeDelta(fontSizeIdx, i)}>
        Takes effect once you leave settings.
      </Picker>

      <Checkbox label="Experimental" value={props.experimental} onChange={props.onExperimentalChange}>
        {(props.experimental) ? 'Experimental features enabled.' : 'Experimental features disabled.'}
      </Checkbox>
    </Card>
  );
};

export default Settings;
