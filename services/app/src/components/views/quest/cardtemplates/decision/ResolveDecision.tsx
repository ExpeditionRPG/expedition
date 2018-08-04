import Button from 'app/components/base/Button';
import Card from 'app/components/base/Card';
import {CardPhase, CardThemeType, MultiplayerState, SettingsType} from 'app/reducers/StateTypes';
import * as pluralize from 'pluralize';
import * as React from 'react';
import {Outcome} from 'shared/schema/templates/Decision';
import {ParserNode} from '../TemplateTypes';
import {computeOutcome, computeSuccesses, extractDecision} from './Actions';

export interface StateProps {
  multiplayerState: MultiplayerState;
  node: ParserNode;
  settings: SettingsType;
}

export interface DispatchProps {
  onRoll: (node: ParserNode, roll: number) => void;
  onEnd: () => void;
}

export interface Props extends StateProps, DispatchProps {}

export default function resolveDecision(props: Props, theme: CardThemeType): JSX.Element {
  const decision = extractDecision(props.node);

  const selected = decision.selected;
  if (selected === null) {
    throw new Error('Expected selected value');
  }

  const inst: JSX.Element = (<span></span>);
  const outcome = computeOutcome(decision.rolls, selected, props.settings, props.multiplayerState);

  // Short-circuit the regular decision logic if we end up with a final outcome. We're
  // only rendering resolve with these states if there isn't a valid one provided by
  // the parser node.
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

  const roll = <img className="inline_icon" src="images/roll_small.svg"></img>;
  const successes = computeSuccesses(decision.rolls, selected);
  return (
    <Card title={(outcome === Outcome.retry) ? 'Keep going!' : 'Resolve Check'} inQuest={true} theme={theme}>
      <p className="center">
        <strong>{selected.difficulty} {selected.persona} {selected.skill}</strong>
      </p>
      <p className="center">
        ({selected.requiredSuccesses - successes} {pluralize('Success', successes)} Needed)
      </p>
      {inst}
      <span>
        <Button onClick={() => props.onRoll(props.node, 18)}>{roll} ≥ 17</Button>
        <Button onClick={() => props.onRoll(props.node, 14)}>{roll} 13 - 16</Button>
        <Button onClick={() => props.onRoll(props.node, 10)}>{roll} 9 - 12</Button>
        <Button onClick={() => props.onRoll(props.node, 6)}>{roll} 5 - 8</Button>
        <Button onClick={() => props.onRoll(props.node, 2)}>{roll} ≤ 4</Button>
      </span>
    </Card>
  );
}
