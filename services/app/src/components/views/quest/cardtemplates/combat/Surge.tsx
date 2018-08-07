import AudioControlsContainer from 'app/components/base/AudioControlsContainer';
import Button from 'app/components/base/Button';
import Callout from 'app/components/base/Callout';
import Card from 'app/components/base/Card';
import Picker from 'app/components/base/Picker';
import TimerCard from 'app/components/base/TimerCard';
import {MAX_ADVENTURER_HEALTH, NODE_ENV} from 'app/Constants';
import {Enemy, EventParameters, Loot} from 'app/reducers/QuestTypes';
import {CardState, MultiplayerState, SettingsType} from 'app/reducers/StateTypes';
import * as React from 'react';
import {REGEX} from 'shared/Regex';
import Roleplay from '../roleplay/Roleplay';
import {ParserNode} from '../TemplateTypes';
import {isSurgeNextRound, roundTimeMillis} from './Actions';
import {CombatPhase, CombatState} from './Types';

export interface StateProps {
  node: ParserNode;
  settings: SettingsType;
}

export interface DispatchProps {
  onReturn: () => void;
  onSurgeNext: (node: ParserNode) => void;
}

export interface Props extends StateProps, DispatchProps {}

export default surge(props: Props); : JSX.Element; {
  let helpText: JSX.Element = (<span></span>);
  if (props.settings.showHelp) {
    helpText = (
      <span>
        <p>
          Immediately follow the surge action listed on all remaining encounter cards. Some Undead surges apply after they've been knocked out.
        </p>
        <p>
          Surge effects happen before abilities. Abilities that apply "this round" do not affect surges (however, loot may still be used during a surge). If you are knocked out during a surge, do not resolve your abilities.
        </p>
      </span>
    );
  }
  return (
    <Card title="Enemy Surge!"
      theme="red"
      inQuest={true}
      onReturn={() => props.onReturn()}
    >
      <h3>An enemy surge occurs!</h3>
      {helpText}
      <Button onClick={() => props.onSurgeNext(props.node)}>Next</Button>
    </Card>
  );
}
