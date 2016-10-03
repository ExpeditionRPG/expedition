import * as React from 'react'
import Card from './base/Card'
import Button from './base/Button'
import NumberPicker from './base/NumberPicker'

export interface PlayerCountSettingStateProps {
  numPlayers: number;
}

export interface PlayerCountSettingDispatchProps {
  onDelta: (numPlayers: number, delta: number) => void;
  onNext: () => void;
}

export interface PlayerCountSettingProps extends PlayerCountSettingStateProps, PlayerCountSettingDispatchProps {};

const PlayerCountSetting = (props: PlayerCountSettingProps): JSX.Element => {
  return (
    <Card title='Player Count'>
      <NumberPicker label="Adventurers" onIncrement={(e)=>props.onDelta(props.numPlayers, 1)} onDecrement={(e)=>props.onDelta(props.numPlayers, -1)} value={props.numPlayers}>
        Set this to the number of players, then hit the Next button.
      </NumberPicker>
      <Button disabled={props.numPlayers===0} onTouchTap={() => props.onNext()}>Next</Button>
    </Card>
  );
}

export default PlayerCountSetting;


