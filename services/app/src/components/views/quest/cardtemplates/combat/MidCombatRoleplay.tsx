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
  maxTier: number;
  node: ParserNode;
  seed: string;
  settings: SettingsType;
}

export interface DispatchProps {
  onChoice: (node: ParserNode, settings: SettingsType, index: number, maxTier: number, seed: string) => void;
  onRetry: () => void;
  onReturn: () => void;
}

export interface Props extends StateProps, DispatchProps {}

export default midCombatRoleplay(props: Props); : JSX.Element; {
  return Roleplay({
    node: props.node,
    onChoice: (settings: SettingsType, node: ParserNode, index: number) => {props.onChoice(props.node, settings, index, props.maxTier, props.seed); },
    onRetry: () => {props.onRetry(); },
    onReturn: () => {props.onReturn(); },
    settings: props.settings,
  }, 'dark');
}
