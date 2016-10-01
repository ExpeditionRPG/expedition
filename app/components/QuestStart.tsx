import * as React from 'react'
import Card from './base/Card'
import Button from './base/Button'
import {XMLElement} from '../reducers/StateTypes'

export interface QuestStartStateProps {
  node: XMLElement;
}

export interface QuestStartDispatchProps {
  onNext: (node: XMLElement) => void;
  onReturn: () => void;
}

export interface QuestStartProps extends QuestStartStateProps, QuestStartDispatchProps {};

const QuestStart = (props: QuestStartProps): JSX.Element => {
  return (
    <Card title="Quest Start" onReturn={props.onReturn}>
      <p>At this time:</p>
      <ol>
        <li><strong>Select</strong> one Adventurer from the deck and pass the deck along.</li>
        <li><strong>Clip</strong> a health tracking clip onto your Adventurer card at full health.</li>
        <li><strong>Keep</strong> this card face up in front of you.</li>
        <li><strong>Draw</strong> the starting abilities listed on the Adventurer card.</li>
        <li><strong>Read</strong> the drawn cards and understand what they do.</li>
        <li>You may mulligan (redraw all of your abilities) once if desired.</li>
        <li><strong>Shuffle</strong> them into a stack face-down in front of you.</li>
        <li><strong>Take</strong> a single D20 die.</li>
      </ol>

      <p>
        During your adventure, pass this device to your right whenever you make
        a decision or hit the "Next" button during the story (not during combat).
      </p>

      <Button onTouchTap={() => props.onNext(props.node)}>Next</Button>
    </Card>
  );
}

export default QuestStart;


