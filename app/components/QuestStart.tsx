import * as React from 'react'
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
  return (
    <Card title="Setup">
      <ol>
        {singlePlayer && <li><strong>Solo play:</strong> Select two adventurers.</li>}
        {multiPlayer && <li><strong>Select</strong> one adventurer from the deck and pass the deck along.</li>}
        {twoAdventurer && <ul><li><strong>1-2 players:</strong> Adventurers with music abilities are not recommended.</li></ul>}

        <li><strong>Clip</strong> a health tracker onto your adventurer at full health.</li>

        <li><strong>Keep</strong> this card face up in front of you.</li>

        <li><strong>Draw</strong> the starting abilities listed on your adventurer.</li>
        {twoAdventurer && <ul><li><strong>1-2 players:</strong> Draft pick each ability (draw three, keep one).</li></ul>}

        <li><strong>Read</strong> through your abilities.</li>

        <li>You may mulligan (redraw all of your abilities) once if desired.</li>

        <li><strong>Shuffle</strong> them into a stack face-down in front of you.</li>

        <li><strong>Get</strong>{multiPlayer && ' at least'} one D20 die.</li>

        <li><strong>Draw</strong> a <strong>helper card</strong> for reference.</li>
      </ol>

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
