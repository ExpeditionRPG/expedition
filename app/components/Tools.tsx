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
  testMusic: () => void;
  testMusicRandom: () => void;
  testMusicStop: () => void;
  testSfx: () => void;
}

export interface ToolsProps extends ToolsStateProps, ToolsDispatchProps {}

const Tools = (props: ToolsProps): JSX.Element => {
  return (
    <Card title="Tools">
      {process.env.NODE_ENV === 'dev' &&
        <div>
          <Button onTouchTap={() => props.testMusic()}>Set Music Intensity (user)</Button>
          <Button onTouchTap={() => props.testMusicRandom()}>Set Music Intensity (random)</Button>
          <Button onTouchTap={() => props.testMusicStop()}>Stop Music</Button>
          <Button onTouchTap={() => props.testSfx()}>SFX</Button>
        </div>
      }
      <Button remoteID="0" id="selectCustomCombat" onTouchTap={() => props.onCustomCombatSelect(props.settings)}>
        <div className="questButtonWithIcon">
          <div className="title">GM Mode</div>
          <div className="summary">You tell the story; the app runs the combat.</div>
        </div>
      </Button>
      <Button remoteID="1" id="selectQuestCreator" onTouchTap={() => props.onQuestCreatorSelect()}>
        <div className="questButtonWithIcon">
          <div className="title">Quest Creator</div>
          <div className="summary">Write your own quests and share them with the world.</div>
        </div>
      </Button>
      <Button remoteID="2" onTouchTap={() => props.onPrivateQuestsSelect(props.user)}>
        <div className="questButtonWithIcon">
          <div className="title">Private Quests</div>
          <div className="summary">View quests you've published privately with the Quest Creator.</div>
        </div>
      </Button>
      {process.env.NODE_ENV === 'dev' &&
        <Button remoteID="3" onTouchTap={() => props.onRemotePlaySelect(props.user)}>
          <div className="questButtonWithIcon">
            <div className="title">(ALPHA) Remote Play</div>
            <div className="summary">Sync your app with friends on another device.</div>
          </div>
        </Button>
      }
      <div className="version">Expedition App v{getAppVersion()}</div>
    </Card>
  );
}

export default Tools;
