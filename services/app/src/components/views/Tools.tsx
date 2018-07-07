import * as React from 'react';
import {NODE_ENV, VERSION} from '../../Constants';
import {openWindow} from '../../Globals';
import {SettingsType, UserState} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';

export interface ToolsStateProps {
  settings: SettingsType;
  user: UserState;
}

export interface ToolsDispatchProps {
  onCustomCombatSelect: (settings: SettingsType) => void;
  onQuestCreatorSelect: () => void;
  onPrivateQuestsSelect: (settings: SettingsType, user: UserState) => void;
  onMultiplayerSelect: (user: UserState) => void;
  testMusic: () => void;
}

export interface ToolsProps extends ToolsStateProps, ToolsDispatchProps {}

const Tools = (props: ToolsProps): JSX.Element => {
  return (
    <Card title="Tools">
      <Button id="selectCustomCombat" onClick={() => props.onCustomCombatSelect(props.settings)}>
        <div className="questButtonWithIcon">
          <div className="title">GM Mode</div>
          <div className="summary">You tell the story; the app runs the combat.</div>
        </div>
      </Button>
      {!props.settings.simulator &&
        <Button id="selectOnlineMultiplayer" onClick={() => props.onMultiplayerSelect(props.user)}>
          <div className="questButtonWithIcon">
            <div className="title">Online Multiplayer - Beta</div>
            <div className="summary">
              {(!props.user || !props.user.loggedIn) ? 'Login and sync' : 'Sync'} your app with friends on another device.
            </div>
          </div>
        </Button>
      }
      {!props.settings.simulator && <Button id="selectQuestCreator" onClick={() => props.onQuestCreatorSelect()}>
        <div className="questButtonWithIcon">
          <div className="title">Quest Creator</div>
          <div className="summary">Write your own quests and share them with the world.</div>
        </div>
      </Button>}
      {!props.settings.simulator && <Button id="selectPrivateQuests" onClick={() => props.onPrivateQuestsSelect(props.settings, props.user)}>
        <div className="questButtonWithIcon">
          <div className="title">Private Quests</div>
          <div className="summary">View quests you've published privately with the Quest Creator (uses your current player count!)</div>
        </div>
      </Button>}
      {NODE_ENV === 'dev' &&
        <div>
          <Button onClick={() => props.testMusic()}>Set Music Intensity</Button>
        </div>
      }
      <div className="version">Expedition App v{VERSION}</div>
      <div className="privacy"><a href="#" onClick={() => openWindow('https://expeditiongame.com/privacy')}>Privacy Policy</a></div>
    </Card>
  );
};

export default Tools;
