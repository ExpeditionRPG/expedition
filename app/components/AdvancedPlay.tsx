import * as React from 'react'
import Card from './base/Card'
import Button from './base/Button'
import {SettingsType} from '../reducers/StateTypes'

export interface AdvancedPlayStateProps {
  settings: SettingsType;
}

export interface AdvancedPlayDispatchProps {
  onCustomCombatSelect: (settings: SettingsType) => any;
}

export interface AdvancedPlayProps extends AdvancedPlayStateProps, AdvancedPlayDispatchProps {}

const AdvancedPlay = (props: AdvancedPlayProps): JSX.Element => {
  return (
    <Card title="Tools">
      <Button onTouchTap={() => props.onCustomCombatSelect(props.settings)}>
        <div className="advanced_play">
          <div className="title">Custom Combat</div>
          <div className="summary">A combat-only mode for those telling their own quests.</div>
        </div>
      </Button>
    </Card>
  );
}

export default AdvancedPlay;
