import * as React from 'react'
import theme from '../theme'
import Card from './base/Card'
import Button from './base/Button'
import {QuestDetails} from '../reducers/QuestTypes'
import {SettingsType} from '../reducers/StateTypes'

export interface AdvancedPlayStateProps {
  settings: SettingsType;
}

export interface AdvancedPlayDispatchProps {
  onSearchSelect: () => any;
  onCustomCombatSelect: (settings: SettingsType) => any;
}

export interface AdvancedPlayProps extends AdvancedPlayStateProps, AdvancedPlayDispatchProps {}

const AdvancedPlay = (props: AdvancedPlayProps): JSX.Element => {
  return (
    <Card title="Advanced Play">
      <Button onTouchTap={() => props.onSearchSelect()}>
        <div className="advanced_play">
          <div className="title">Browse Online Quests</div>
          <div className="summary">Select from quests published by players around the world!</div>
        </div>
      </Button>
      <Button onTouchTap={() => props.onCustomCombatSelect(props.settings)}>
        <div className="advanced_play">
          <div className="title">Custom Combat</div>
          <div className="summary">A streamlined combat-only mode for those telling their own quests.</div>
        </div>
      </Button>
    </Card>
  );
}

export default AdvancedPlay;