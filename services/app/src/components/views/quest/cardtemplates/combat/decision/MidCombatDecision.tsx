import * as React from 'react';
import {REGEX} from 'shared/Regex';
import {Outcome} from 'shared/schema/templates/Decision';
import {CardState, MultiplayerState, SettingsType} from 'app/reducers/StateTypes';
import Button from 'app/components/base/Button';
import Callout from 'app/components/base/Callout';
import Card from 'app/components/base/Card';
import {computeOutcome} from '../decision/Actions';
import {getScenarioInstruction} from './decision/Scenarios';

export interface StateProps {
  card: CardState;
  decision: DecisionState;
  multiplayerState: MultiplayerState;
  node: ParserNode;
  seed: string;
  settings: SettingsType;
}

export interface DispatchProps {
  onDecisionSelect: (node: ParserNode, selected: LeveledSkillCheck, elapsedMillis: number) => void;
  onDecisionEnd: () => void;
  onDecisionRoll: (node: ParserNode, roll: number) => void;
  onDecisionSetup: (node: ParserNode, seed: string) => void;
  onDecisionTimerStart: () => void;
}

export interface Props extends StateProps, DispatchProps {}

export default function midCombatDecision(props: Props): JSX.Element {
  const decision = props.decision;

  if (decision.selected) {
    const outcome = computeOutcome(decision.rolls, decision.selected, props.settings, props.multiplayerState);

    // Short-circuit the regular decision logic if we end up with a final outcome
    // TODO: this flickers due to rng when back button is pressed
    if (outcome !== null && outcome !== Outcome.retry) {
      const instruction = getScenarioInstruction(decision.selected, outcome, props.seed);
      const title = ({
        [Outcome.success]: 'Success!',
        [Outcome.failure]: 'Failure!',
        [Outcome.interrupted]: 'Interrupted!',
      } as Record<keyof typeof Outcome, string>)[outcome];
      return (
        <Card title={title} theme="dark" inQuest={true}>
          <Callout icon="adventurer_white">{instruction}</Callout>
          <Button onClick={() => props.onNext('PREPARE')}>Next</Button>
        </Card>
      );
    }
  }

  return Decision({
    card: {...props.card, phase: props.combat.decisionPhase},
    decision,
    multiplayerState: props.multiplayerState,
    node: props.node,
    onSelect: props.onDecisionSelect,
    onEnd: props.onDecisionEnd,
    onRoll: props.onDecisionRoll,
    onStartTimer: props.onDecisionTimerStart,
    seed: props.seed,
    settings: props.settings,
  }, 'dark');
}
