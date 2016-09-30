import * as React from 'react'
import Card from './base/Card'
import Button from './base/Button'
import {XMLElement, CombatPhase} from '../scripts/QuestParser'

export interface CombatStateProps {
  node: XMLElement;
  icon: string;
  phase: CombatPhase;
  enemies: {name: string}[];
}

export interface CombatDispatchProps {
  onNext: (node: XMLElement, phase: CombatPhase) => void;
  onEvent: (node: XMLElement, event: string) => void;
  onReturn: () => void;
}

export interface CombatProps extends CombatStateProps, CombatDispatchProps {};

const Combat = (props: CombatProps): JSX.Element => {
  switch(props.phase) {
    case 'DRAW_ENEMIES':
      return (
        <Card title='Draw Enemies' onReturn={props.onReturn}>
          Prepare to Fight (TODO)
          <Button onTouchTap={() => props.onNext(props.node, 'PREPARE')}>Next</Button>
        </Card>
      );
    case 'PREPARE':
      return (
        <Card title='Prepare for Combat' onReturn={props.onReturn}>
          Ready to begin?
          <Button onTouchTap={() => props.onNext(props.node, 'TIMER')}>Start Timer</Button>
        </Card>
      );
    case 'TIMER':
      return (
        <Card title='Timer' onReturn={props.onReturn}>
          TODO TIMER
          <Button onTouchTap={() => props.onNext(props.node, 'RESOLVE_ABILITIES')}>Stop Timer</Button>
        </Card>
      );
    case 'RESOLVE_ABILITIES':
      return (
        <Card title='Roll & Resolve' onReturn={props.onReturn}>
          TODO Flavortext
          <Button onTouchTap={() => props.onNext(props.node, 'ENEMY_TIER')}>Next</Button>
        </Card>
      );
    case 'ENEMY_TIER':
      return (
        <Card title='Enemy Strength' onReturn={props.onReturn}>
          Ready to begin?
          <Button onTouchTap={() => props.onNext(props.node, 'VICTORY')}>End Encounter (Victory)</Button>
          <Button onTouchTap={() => props.onNext(props.node, 'PLAYER_TIER')}>Next</Button>
        </Card>
      );
    case 'PLAYER_TIER':
      return (
        <Card title='Take Damage' onReturn={props.onReturn}>
          All Adventerurs TODO Damage
          <Button onTouchTap={() => props.onNext(props.node, 'DEFEAT')}>End Encounter (Defeat)</Button>
          <Button onTouchTap={() => props.onNext(props.node, 'PREPARE')}>Next</Button>
        </Card>
      );
    case 'VICTORY':
      return (
        <Card title='Victory' onReturn={props.onReturn}>
          Congrats.
          <Button onTouchTap={() => props.onEvent(props.node, 'win')}>Next</Button>
        </Card>
      );
    case 'DEFEAT':
      return (
        <Card title='Defeat' onReturn={props.onReturn}>
          Lame.
          <Button onTouchTap={() => props.onEvent(props.node, 'lose')}>Next</Button>
        </Card>
      );
    default:
      throw new Error("Unknown combat phase " + props.phase);
  }
}

export default Combat;


