import Button from 'app/components/base/Button';
import Callout from 'app/components/base/Callout';
import Card from 'app/components/base/Card';
import * as React from 'react';
import {Outcome} from 'shared/schema/templates/Decision';
import {capitalizeFirstLetter, formatImg} from '../Render';
import {ParserNode} from '../TemplateTypes';
import {computeOutcome, computeSuccesses, extractDecision} from './Actions';
import {getScenarioInstruction} from './Scenarios';
import {EMPTY_LEVELED_CHECK, StateProps} from './Types';

const pluralize = require('pluralize');

export interface DispatchProps {
  onRoll: (node: ParserNode, roll: number) => void;
  onCombatDecisionEnd: () => void;
  onReturn: () => void;
}

export interface Props extends StateProps, DispatchProps {}

export default function resolveDecision(props: Props): JSX.Element {
  const decision = extractDecision(props.node);
  const selected = decision.selected || EMPTY_LEVELED_CHECK;
  const inst: JSX.Element = (<span></span>);

  // hasInterrupted = true here, as it only matters when an action hasn't already
  // moved us to another node.
  const outcome = computeOutcome(decision.rolls, selected, props.settings, props.node, props.multiplayerState, true);

  // Short-circuit the regular decision logic if we end up with a final outcome. We're
  // only rendering resolve with these states if there isn't a valid one provided by
  // the parser node.
  // TODO: this flickers due to rng when back button is pressed
  if (outcome !== null && outcome !== Outcome.retry) {
    const instruction = getScenarioInstruction(selected, outcome, props.rng);
    const title = ({
      [Outcome.success]: 'Success!',
      [Outcome.failure]: 'Failure!',
      [Outcome.interrupted]: 'Interrupted!',
    } as Record<keyof typeof Outcome, string>)[outcome];
    return (
      <Card title={title} theme={props.theme} inQuest={true}>
        {(instruction)
          ? <Callout icon={formatImg('adventurer', props.theme, false)}>{instruction}</Callout>
          : <p>Nothing happens.</p>
        }
        <Button onClick={() => props.onCombatDecisionEnd()}>Next</Button>
      </Card>
    );
  }

  const prevSuccesses = computeSuccesses(decision.rolls.slice(0, decision.rolls.length - 1), selected);
  const successes = computeSuccesses(decision.rolls, selected);
  let helpText: JSX.Element = <span></span>;
  if (props.settings.showHelp) {
    helpText = (<span>
      <h2>Roll <img className="inline_icon" src={'images/' + formatImg('roll', props.theme) + '.svg'}></img></h2>
      <p>
        <strong>Roll</strong> for a single adventurer, picked by the party.
      </p>
      <h2>Add <img className="inline_icon" src={'images/' + formatImg('skill', props.theme) + '.svg'}></img></h2>
      <p>
        <strong>Add</strong> the sum of levels of their {selected.skill} skills to their roll.
        {selected.persona && ` Also add 1 if the adventurer's persona type is ${selected.persona}.`}
      </p>
      <h2>Resolve <img className="inline_icon" src={'images/' + formatImg('damage', props.theme) + '.svg'}></img></h2>
      <p>
        <strong>Tap</strong> the button matching your modified roll.
      </p>
      <p>
        <strong>Careful!</strong> Some actions are riskier than others,
        <br/>and rolling too low may cause bad things to happen.
      </p>
    </span>);
  }

  const numLeft = selected.requiredSuccesses - successes;
  const roll = <img className="inline_icon" src={'images/' + formatImg('roll', props.theme) + '.svg'}></img>;
  return (
    <Card
      title={[capitalizeFirstLetter(selected.persona), capitalizeFirstLetter(selected.skill), 'Check'].filter((s) => s).join(' ')}
      inQuest={true}
      theme={props.theme}
      onReturn={() => props.onReturn()}>
      {helpText}
      {inst}
      <h2 className="center">
        {(decision.rolls.length > 0)
          ? ((successes - prevSuccesses <= 0)
            ? `Failed; ${numLeft} ${pluralize('Success', numLeft)} Needed`
            : `Success! ${numLeft} More Needed`
          )
          : `${numLeft} ${pluralize('Success', numLeft)} Needed`
        }
      </h2>
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
