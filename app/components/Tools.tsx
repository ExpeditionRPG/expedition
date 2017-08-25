import * as React from 'react'
import Card from './base/Card'
import Button from './base/Button'
import {SettingsType} from '../reducers/StateTypes'

export interface ToolsStateProps {
  settings: SettingsType;
}

export interface ToolsDispatchProps {
  onCustomCombatSelect: (settings: SettingsType) => any;
  onQuestCreatorSelect: () => any;
}

export interface ToolsProps extends ToolsStateProps, ToolsDispatchProps {}

const Tools = (props: ToolsProps): JSX.Element => {
  return (
    <Card title="Tools">
      <Button id="selectCustomCombat" onTouchTap={() => props.onCustomCombatSelect(props.settings)}>
        <div className="questButtonWithIcon">
          <div className="title">Custom Combat</div>
          <div className="summary">A combat-only mode for those telling their own quests.</div>
        </div>
      </Button>
      <Button id="selectQuestCreator" onTouchTap={() => props.onQuestCreatorSelect()}>
        <div className="questButtonWithIcon">
          <div className="title">Quest Creator</div>
          <div className="summary">Write your own quests and share them with the world.</div>
        </div>
      </Button>
    </Card>
  );
}

export default Tools;
