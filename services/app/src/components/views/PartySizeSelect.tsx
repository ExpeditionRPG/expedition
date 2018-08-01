import * as React from 'react';
import Button from '../base/Button';
import Card from '../base/Card';
import Picker from '../base/Picker';

export interface StateProps {
  numPlayers: number;
}

export interface DispatchProps {
  onDelta: (numPlayers: number, delta: number) => void;
  onNext: () => void;
}

interface Props extends StateProps, DispatchProps {}

const PartySizeSelect = (props: Props): JSX.Element => {
  return (
    <Card title="Party Size">
      <Picker label="Adventurers" onDelta={(i: number) => props.onDelta(props.numPlayers, i)} value={props.numPlayers}>
        Set this to the number of players, then hit the Next button.
      </Picker>
      <Button disabled={props.numPlayers === 0} onClick={() => props.onNext()}>Next</Button>
    </Card>
  );
};

export default PartySizeSelect;
