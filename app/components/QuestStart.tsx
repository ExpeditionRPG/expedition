import * as React from 'react'
import Card from './base/Card'
import Button from './base/Button'
import {XMLElement} from '../scripts/QuestParser'

export interface QuestStartStateProps {
  firstElem: XMLElement;
}

export interface QuestStartDispatchProps {
  onNext: (firstElem: XMLElement) => void;
  onReturn: () => void;
}

export interface QuestStartProps extends QuestStartStateProps, QuestStartDispatchProps {};

const QuestStart = (props: QuestStartProps): JSX.Element => {
  return (
    <Card title="Quest Start" onReturn={props.onReturn}>
      TODO: Setup instructions
      <Button onTouchTap={() => props.onNext(props.firstElem)}>Next</Button>
    </Card>
  );
}

export default QuestStart;


