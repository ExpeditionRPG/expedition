import Button from '@material-ui/core/Button';
import {getContentSets, numPlayers} from 'app/actions/Settings';
import * as React from 'react';
import {CONTENT_SET_FULL_NAMES, Expansion, VERSION} from 'shared/schema/Constants';
import {URLS} from '../../Constants';
import {openWindow} from '../../Globals';
import {DifficultyType, FontSizeType, MultiplayerState, SettingsType} from '../../reducers/StateTypes';
import Card from '../base/Card';
import Checkbox from '../base/Checkbox';
import Picker from '../base/Picker';
import PlayerCount from '../base/PlayerCount';

export interface StateProps {
  settings: SettingsType;
  multiplayer: MultiplayerState;
}

export interface DispatchProps {
  onAudioChange: (change: boolean) => void;
  onAutoRollChange: (change: boolean) => void;
  onDifficultyDelta: (difficulty: DifficultyType, i: number) => void;
  onExpansionSelect: () => void;
  onExperimentalChange: (change: boolean) => void;
  onFontSizeDelta: (idx: number, delta: number) => void;
  onMultitouchChange: (change: boolean) => void;
  onPlayerChange: (numLocalPlayers: number) => void;
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

function stringifyContentSet(cs: Expansion[]): string {
  return [Expansion.base, ...cs].map((name: Expansion) => CONTENT_SET_FULL_NAMES[name]).join(' + ');
}

const Settings = (props: Props): JSX.Element => {
  const difficultyIdx = difficultyValues.indexOf(props.settings.difficulty);
  const fontSizeIdx = fontSizeValues.indexOf(props.settings.fontSize);
  const timerIdx = props.settings.timerSeconds ? timerValues.indexOf(props.settings.timerSeconds) : 0;
  const allPlayers = numPlayers(props.settings, props.multiplayer);
  const localExpansions = stringifyContentSet(Object.keys(props.settings.contentSets).filter((k: Expansion) => props.settings.contentSets[k]) as Expansion[]);
  const globalExpansions = stringifyContentSet([...getContentSets(props.settings, props.multiplayer)]);

  const expansions = (props.multiplayer.session)
    ? <p className="expansionLabel">
        Locally: <strong>{localExpansions}</strong><br/>
        All Devices: <strong>{globalExpansions}</strong>
      </p>
    : <p className="expansionLabel">Currently playing: <strong>{globalExpansions}</strong></p>;

  return (
    <Card title="Settings">
      <Button className="primary large" onClick={() => props.onExpansionSelect()}>Choose game / expansion</Button>
      {expansions}

      <PlayerCount id="playerCount" localPlayers={props.settings.numLocalPlayers} allPlayers={allPlayers} onChange={(i: number) => props.onPlayerChange(i)} />

      <Checkbox id="multitouch" label="Multitouch" value={props.settings.multitouch} onChange={props.onMultitouchChange}>
        {(props.settings.multitouch) ? 'All players must hold their finger on the screen to end combat.' : 'A single tap will end combat.'}
      </Checkbox>

      <Picker label="Difficulty" value={difficultyText[difficultyIdx].title} onDelta={(i: number) => props.onDifficultyDelta(props.settings.difficulty, i)}>
        {difficultyText[difficultyIdx].text}
      </Picker>

      <Picker label="Timer" value={timerText[timerIdx].title} onDelta={(i: number) => props.onTimerSecondsDelta(timerIdx, i)}>
        <div>
          {timerText[timerIdx].text}
          {props.settings.numLocalPlayers === 1 ? <span><br/><strong>Solo play:</strong> Timers are doubled.</span> : ''}
        </div>
      </Picker>

      <Checkbox id="sound" label="Sound" value={props.settings.audioEnabled} onChange={props.onAudioChange}>
        {(props.settings.audioEnabled) ? 'Music and sound effects enabled.' : 'Music and sound effects disabled.'}
      </Checkbox>

      <Checkbox id="help" label="Show Help" value={props.settings.showHelp} onChange={props.onShowHelpChange}>
        {(props.settings.showHelp) ? 'Setup and combat hints are shown.' : 'Setup and combat hints are hidden.'}
      </Checkbox>

      <Checkbox id="vibration" label="Vibration" value={props.settings.vibration} onChange={props.onVibrationChange}>
        {(props.settings.vibration) ? 'Vibrate on touch.' : 'Do not vibrate.'}
      </Checkbox>

      <Checkbox id="autoroll" label="Auto-Roll" value={props.settings.autoRoll} onChange={props.onAutoRollChange}>
        {(props.settings.autoRoll) ? 'Automatically roll for the party when resolving combat.' : 'Do not show pre-generated rolls in combat.'}
      </Checkbox>

      <Picker label="Font Size" value={fontSizeValues[fontSizeIdx]} onDelta={(i: number) => props.onFontSizeDelta(fontSizeIdx, i)}>
        Takes effect once you leave settings.
      </Picker>

      <Checkbox id="experimental" label="Experimental" value={props.settings.experimental} onChange={props.onExperimentalChange}>
        {(props.settings.experimental) ? 'Experimental features are currently enabled.' : 'Experimental features are currently disabled.'}
      </Checkbox>

      <div className="version">Expedition App v{VERSION}</div>
      <div className="privacy"><a href="#" onClick={() => openWindow(URLS.PRIVACY_POLICY)}>Privacy Policy</a></div>
    </Card>
  );
};

export default Settings;
