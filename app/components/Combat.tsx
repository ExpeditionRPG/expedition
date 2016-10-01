import * as React from 'react'
import Card from './base/Card'
import Button from './base/Button'
import {XMLElement} from '../reducers/StateTypes'
import {CombatPhaseNameType, MidCombatPhase, CombatDetails, Enemy} from '../reducers/QuestTypes'
import TimerCard from './base/TimerCard'

export interface CombatStateProps {
  node: XMLElement;
  combat: CombatDetails;
  phase: CombatPhaseNameType;
  icon: string;
}

export interface CombatDispatchProps {
  onNext: (phase: CombatPhaseNameType) => void;
  onTimerStop: (elapsedMillis: number) => void;
  onEvent: (event: string) => void;
  onReturn: () => void;
}

export interface CombatProps extends CombatStateProps, CombatDispatchProps {};

const Combat = (props: CombatProps): JSX.Element => {
  let phase = props.phase || 'DRAW_ENEMIES';
  switch(phase) {
    case 'DRAW_ENEMIES':
      let enemies: JSX.Element[] = (props.combat.phase as MidCombatPhase).enemies.map(function(enemy: Enemy, index: number) {
        return (
          <div key={index}>{enemy.name} (Tier {enemy.tier})</div>
        );
      });
      return (
        <Card title='Draw Enemies' onReturn={props.onReturn}>
          Prepare to Fight:
          {enemies}
          <Button onTouchTap={() => props.onNext('PREPARE')}>Next</Button>
        </Card>
      );
    case 'PREPARE':
      return (
        <Card title='Prepare for Combat' onReturn={props.onReturn}>
          Ready to begin?
          <Button onTouchTap={() => props.onNext('TIMER')}>Start Timer</Button>
        </Card>
      );
    case 'TIMER':
      return (
        <TimerCard
          numPlayers={(props.combat.phase as MidCombatPhase).numAliveAdventurers}
          roundTimeTotalMillis={props.combat.settings.roundTimeMillis}
          onTimerStop={props.onTimerStop} />
      );
    case 'RESOLVE_ABILITIES':
      return (
        <Card title='Roll & Resolve' onReturn={props.onReturn}>
          TODO Flavortext
          <Button onTouchTap={() => props.onNext('ENEMY_TIER')}>Next</Button>
        </Card>
      );
    case 'ENEMY_TIER':
      return (
        <Card title='Enemy Strength' onReturn={props.onReturn}>
          TODO Flavortext
          <Button onTouchTap={() => props.onNext('VICTORY')}>End Encounter (Victory)</Button>
          <Button onTouchTap={() => props.onNext('PLAYER_TIER')}>Next</Button>
        </Card>
      );
    case 'PLAYER_TIER':
      return (
        <Card title='Take Damage' onReturn={props.onReturn}>
          All Adventerurs TODO Damage
          <Button onTouchTap={() => props.onNext('DEFEAT')}>End Encounter (Defeat)</Button>
          <Button onTouchTap={() => props.onNext('PREPARE')}>Next</Button>
        </Card>
      );
    case 'VICTORY':
      return (
        <Card title='Victory' onReturn={props.onReturn}>
          Congrats.
          <Button onTouchTap={() => props.onEvent('win')}>Next</Button>
        </Card>
      );
    case 'DEFEAT':
      return (
        <Card title='Defeat' onReturn={props.onReturn}>
          Lame.
          <Button onTouchTap={() => props.onEvent('lose')}>Next</Button>
        </Card>
      );
    default:
      throw new Error("Unknown combat phase " + phase);
  }
}

export default Combat;


