import TimerCard from 'app/components/base/TimerCard';
import {MultiplayerState, SettingsType} from 'app/reducers/StateTypes';
import * as React from 'react';
import {ParserNode} from '../TemplateTypes';
import {isSurgeNextRound, roundTimeMillis} from './Actions';
import {CombatState} from './Types';

export interface StateProps {
  combat: CombatState;
  multiplayerState: MultiplayerState;
  node: ParserNode;
  numAliveAdventurers: number;
  seed: string;
  settings: SettingsType;
}

export interface DispatchProps {
  onTimerStop: (node: ParserNode, settings: SettingsType, elapsedMillis: number, surge: boolean, seed: string) => void;
}

export interface Props extends StateProps, DispatchProps {}

export default function timerCard(props: Props): JSX.Element {
  const surge = isSurgeNextRound(props.node.ctx.templates.combat);
  const surgeWarning = (props.settings.difficulty === 'EASY' && surge) ? 'Surge Imminent' : undefined;
  let instruction: string|undefined;
  if (props.settings.showHelp) {
    if (props.settings.numPlayers > 1) {
      if (props.settings.multitouch) {
        instruction = 'All players: hold one finger once you play an ability';
      } else {
        instruction = 'Tap the screen once all players have played an ability';
      }
    } else {
      instruction = 'Tap the screen once you\'ve played an ability for each adventurer';
    }
  }

  const enemies = props.combat.enemies;
  const enemy = enemies[Math.floor(Math.random() * enemies.length)];
  const enemyClass = ((enemy || {}).class || '').toLowerCase();

  return (
    <TimerCard
      theme="dark"
      secondaryText={surgeWarning}
      tertiaryText={instruction}
      icon={enemyClass}
      numPlayers={(props.settings.multitouch && props.settings.numPlayers > 1) ? props.numAliveAdventurers : 1}
      roundTimeTotalMillis={roundTimeMillis(props.settings, props.multiplayerState)}
      multiplayerState={props.multiplayerState}
      onTimerStop={(ms: number) => props.onTimerStop(props.node, props.settings, ms, surge, props.seed)} />
  );
}
