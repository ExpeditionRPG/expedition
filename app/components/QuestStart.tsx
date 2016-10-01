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
      TODO: Setup instructions
      <Button onTouchTap={() => props.onNext(props.node)}>Next</Button>
    </Card>
  );
}

export default QuestStart;


