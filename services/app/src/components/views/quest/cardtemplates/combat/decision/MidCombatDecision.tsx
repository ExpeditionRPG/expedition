import Button from 'app/components/base/Button';
import Callout from 'app/components/base/Callout';
import Card from 'app/components/base/Card';
import {CardPhase, MultiplayerState, SettingsType} from 'app/reducers/StateTypes';
import * as React from 'react';
import {Outcome} from 'shared/schema/templates/Decision';
import {computeOutcome} from '../../decision/Actions';
import Decision from '../../decision/Decision';
import {DecisionState, LeveledSkillCheck} from '../../decision/Types';
import {ParserNode} from '../../TemplateTypes';
import {getScenarioInstruction} from './Scenarios';

export interface StateProps {
  phase: CardPhase;
  decision: DecisionState;
  multiplayerState: MultiplayerState;
  node: ParserNode;
  seed: string;
  settings: SettingsType;
}

export interface DispatchProps {
  onSelect: (node: ParserNode, selected: LeveledSkillCheck, elapsedMillis: number) => void;
  onEnd: () => void;
  onRoll: (node: ParserNode, roll: number) => void;
  onTimerStart: () => void;
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
          <Button onClick={() => props.onEnd()}>Next</Button>
        </Card>
      );
    }
  }

  return Decision({
    phase: props.phase,
    decision,
    multiplayerState: props.multiplayerState,
    node: props.node,
    onSelect: props.onSelect,
    onEnd: props.onEnd,
    onRoll: props.onRoll,
    onStartTimer: props.onTimerStart,
    seed: props.seed,
    settings: props.settings,
  }, 'dark');
}
