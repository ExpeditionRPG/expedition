import * as React from 'react'
import Card from './base/Card'
import Button from './base/Button'
import Picker from './base/Picker'

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
      <Picker label="Adventurers" onDelta={(i: number)=>props.onDelta(props.numPlayers, i)} value={props.numPlayers}>
        Set this to the number of players, then hit the Next button.
      </Picker>
      <Button disabled={props.numPlayers===0} onTouchTap={() => props.onNext()}>Next</Button>
    </Card>
  );
}

export default PlayerCountSetting;


