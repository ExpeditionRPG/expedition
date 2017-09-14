import * as React from 'react'
import Card from './base/Card'
import Button from './base/Button'
import {getAppVersion} from'../Globals'
import {SettingsType, UserState} from '../reducers/StateTypes'

export interface ToolsStateProps {
  settings: SettingsType;
  user: UserState;
}

export interface ToolsDispatchProps {
  onCustomCombatSelect: (settings: SettingsType) => void;
  onQuestCreatorSelect: () => void;
  onPrivateQuestsSelect: (user: UserState) => void;
  onRemotePlaySelect: (user: UserState) => void;
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
      <Button onTouchTap={() => props.onPrivateQuestsSelect(props.user)}>
        <div className="questButtonWithIcon">
          <div className="title">Private Quests</div>
          <div className="summary">View quests you've published privately with the Quest Creator.</div>
        </div>
      </Button>
      <Button onTouchTap={() => props.onRemotePlaySelect(props.user)}>
        <div className="questButtonWithIcon">
          <div className="title">(BETA) Remote Play</div>
          <div className="summary">Sync your app with friends on another device.</div>
        </div>
      </Button>
      <div className="version">Expedition App v{getAppVersion()}</div>
    </Card>
  );
}

export default Tools;
