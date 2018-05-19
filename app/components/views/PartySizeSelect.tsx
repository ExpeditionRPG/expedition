import * as React from 'react'
import Card from '../base/Card'
import Button from '../base/Button'
import Picker from '../base/Picker'

export interface PartySizeSelectStateProps {
  numPlayers: number;
}

export interface PartySizeSelectDispatchProps {
  onDelta: (numPlayers: number, delta: number) => void;
  onNext: () => void;
}

export interface PartySizeSelectProps extends PartySizeSelectStateProps, PartySizeSelectDispatchProps {};

const PartySizeSelect = (props: PartySizeSelectProps): JSX.Element => {
  return (
    <Card title="Party Size">
      <Picker label="Adventurers" onDelta={(i: number)=>props.onDelta(props.numPlayers, i)} value={props.numPlayers}>
        Set this to the number of players, then hit the Next button.
      </Picker>
      <Button disabled={props.numPlayers===0} onTouchTap={() => props.onNext()}>Next</Button>
    </Card>
  );
}

export default PartySizeSelect;


