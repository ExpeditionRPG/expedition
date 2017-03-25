import * as React from 'react'
import Card from './base/Card'
import Button from './base/Button'
import {XMLElement, SettingsType} from '../reducers/StateTypes'

export interface QuestStartStateProps {
  node: XMLElement;
  settings: SettingsType;
}

export interface QuestStartDispatchProps {
  onNext: (node: XMLElement) => void;
}

export interface QuestStartProps extends QuestStartStateProps, QuestStartDispatchProps {};

// TODO: Refactor this into a QUEST_CARD
const QuestStart = (props: QuestStartProps): JSX.Element => {
  const singlePlayer = (props.settings.numPlayers === 1);
  const multiPlayer = (props.settings.numPlayers > 1);
  return (
    <Card title="Setup">
      <ol>
        <li><strong>Select</strong> one adventurer from the deck{multiPlayer && ' and pass the deck along'}.</li>
        {singlePlayer && <ul><li><strong>Single Player:</strong> Adventurers with music abilities are not recommended for solo play.</li></ul>}
        <li><strong>Clip</strong> a health tracker onto your adventurer at full health.</li>
        <li><strong>Keep</strong> this card face up in front of you.</li>
        <li><strong>Draw</strong> the starting abilities listed on your adventurer.</li>
        {singlePlayer && <ul><li><strong>Single Player:</strong> When drawing each ability, you may draft pick (draw three, keep one).</li></ul>}
        <li><strong>Read</strong> the drawn cards and understand what they do.</li>
        <li>You may mulligan (redraw all of your abilities) once if desired.</li>
        <li><strong>Shuffle</strong> them into a stack face-down in front of you.</li>
        <li><strong>Get</strong>{multiPlayer && ' at least'} one D20 die.</li>
        <li><strong>Draw</strong> a <strong>helper card</strong> for reference.</li>
      </ol>

      {multiPlayer && <p>
        During your adventure, pass this device to your right whenever you make
        a decision or hit the "Next" button during the story (not during combat).
      </p>}

      <Button onTouchTap={() => props.onNext(props.node)}>Next</Button>
    </Card>
  );
}

export default QuestStart;
