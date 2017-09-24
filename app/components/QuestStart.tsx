import * as React from 'react'
import Callout from './base/Callout'
import Card from './base/Card'
import Button from './base/Button'
import {SettingsType} from '../reducers/StateTypes'

export interface QuestStartStateProps {
  settings: SettingsType;
}

export interface QuestStartDispatchProps {
  onNext: () => void;
}

export interface QuestStartProps extends QuestStartStateProps, QuestStartDispatchProps {};

// TODO: Refactor this into a QUEST_CARD
const QuestStart = (props: QuestStartProps): JSX.Element => {
  const singlePlayer = (props.settings.numPlayers === 1);
  const twoAdventurer = (props.settings.numPlayers === 1 || props.settings.numPlayers === 2);
  const multiPlayer = (props.settings.numPlayers > 1);
  const theHorror = (props.settings.contentSets.horror === true);
  return (
    <Card title="Setup">
      <h2>Adventurers</h2>
      {singlePlayer && <p><strong>Solo play:</strong> Select two adventurers of your choice and set them face up in front of you.</p>}
      {multiPlayer && <p><strong>Select</strong> one adventurer of your choice from the deck, set it face up in front of you and pass the deck along.</p>}
      {twoAdventurer && <Callout icon="adventurer"><strong>1-2 players:</strong> Adventurers with music abilities are not recommended.</Callout>}
      {theHorror && <Callout icon="horror"><strong>The Horror:</strong> Draw a persona card, set it face up in front of you, and attach a clip at "Base".</Callout>}
      <p><strong>Clip</strong> a health tracker onto your adventurer at full health.</p>

      <h2>Abilities</h2>
      <p><strong>Draw</strong> the starting abilities listed on your adventurer.</p>
      {twoAdventurer && <Callout icon="adventurer"><strong>1-2 players:</strong> Draft pick each ability (draw three, keep one, put the other two on the bottom of the deck).</Callout>}
      {theHorror && <Callout icon="horror"><strong>The Horror:</strong> Also draw an additional Influence ability (start with 7 abilities).</Callout>}
      <p><strong>Read</strong> through your abilities. You may mulligan (redraw all) once if desired.</p>
      <p><strong>Shuffle</strong> them into a stack face-down in front of you.</p>

      <h2>Sundries</h2>
      <p><strong>Get</strong>{multiPlayer && ' at least'} one D20 die.</p>
      <p><strong>Draw</strong> a <strong>helper card</strong> for reference.</p>

      {multiPlayer && <p>
        During your adventure, pass this device to your right whenever you make a decision
        or hit the "Next" button during the story.
        {props.settings.multitouch && <span> During combat, place this device in the center of the table.</span>}
        {!props.settings.multitouch && <span> During combat, one player should manage the device.</span>}
      </p>}

      <Button onTouchTap={() => props.onNext()}>Next</Button>
    </Card>
  );
}

export default QuestStart;
