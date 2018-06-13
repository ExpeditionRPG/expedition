
import * as React from 'react'
import * as seedrandom from 'seedrandom'
import Button from '../../../../base/Button'
import Card from '../../../../base/Card'
import Callout from '../../../../base/Callout'
import {ParserNode} from '../TemplateTypes'
import {SettingsType, CardState, CardThemeType, MultiplayerState} from '../../../../../reducers/StateTypes'
import {generateDecisions, skillTimeMillis} from './Actions'
import {DecisionState, DecisionType, EMPTY_OUTCOME} from './Types'
import DecisionTimer from './DecisionTimer'

export interface DecisionStateProps {
  card: CardState;
  decision: DecisionState;
  settings: SettingsType;
  node: ParserNode;
  seed: string;
  maxAllowedAttempts?: number;
  multiplayerState?: MultiplayerState;
}

export interface DecisionDispatchProps {
  onStartTimer: () => void;
  onChoice: (node: ParserNode, settings: SettingsType, choice: DecisionType, elapsedMillis: number, seed: string) => void;
  onRoll: (node: ParserNode, settings: SettingsType, decision: DecisionState, roll: number, seed: string) => void;
  onEnd: () => void;
}

export interface DecisionProps extends DecisionStateProps, DecisionDispatchProps {}

export function renderPrepareDecision(props: DecisionProps): JSX.Element {
  // Note: similar help text in renderNoTimer()
  let helpText: JSX.Element = (<span></span>);
  if (props.settings.showHelp) {
    helpText = (
      <div>
        <ol>
          <li>
            <strong>Keep</strong> your skill and persona cards within sight.
          </li>
          <li><strong>Start</strong> the timer.</li>
          <li><strong>Select</strong> one of the combinations of difficulty, persona type, and skill type from the timer page.</li>
          <li><strong>Be careful!</strong> If the timer runs out, the event becomes more difficult.</li>
        </ol>
      </div>
    );
  }

  return (
    <Card title="Skill Check" theme="dark" inQuest={true}>
      {helpText}
      <Button className="bigbutton" onClick={() => props.onStartTimer()}>Begin Skill Check</Button>
    </Card>
  );
}

export function renderDecisionTimer(props: DecisionProps): JSX.Element {
  let instruction: string|undefined = undefined;
  if (props.settings.showHelp) {
    instruction = 'Select a decision!';
  }

  const arng = seedrandom.alea(props.seed);

  return (
    <DecisionTimer
      theme="dark"
      decisions={generateDecisions(props.settings, arng, props.maxAllowedAttempts)}
      roundTimeTotalMillis={skillTimeMillis(props.settings, props.multiplayerState)}
      onDecision={(d: DecisionType, ms: number) => props.onChoice(props.node, props.settings, d, ms, props.seed)} />
  );
}

export function renderResolveDecision(props: DecisionProps): JSX.Element {
  const scenario = props.decision.scenario;
  const roll = <img className="inline_icon" src="images/roll_white_small.svg"></img>;
  const outcome = props.decision.outcomes[props.decision.outcomes.length-1] || EMPTY_OUTCOME;
  const choice = props.decision.choice;

  // Note: similar help text in renderNoTimer()
  let inst: JSX.Element = (<span></span>);

  if (outcome.instructions.length > 0) {
    const elems = outcome.instructions.map((instruction: string, i: number) => {
      return <Callout key={i} icon="adventurer_white">{instruction}</Callout>;
    });
    inst = <span>{elems}</span>;
  } else if (props.settings.showHelp && outcome.type === 'RETRY') {
    inst = (
      // TODO: show the decision made
      // TODO: Show the specific skill and hide persona if not used.
      <span>
        <p>{(props.decision.outcomes.length > 0) ? 'Choose another' : 'One'} adventurer:</p>
        <ol>
          <li><strong>Roll</strong> a D20.</li>
          <li><strong>Add</strong> your highest {choice.skill} skill level to the roll.</li>
          {choice.persona && <li><strong>Add</strong> 2 to your roll if your persona is {choice.persona}.</li>}
          <li><strong>Select</strong> your result.</li>
        </ol>
      </span>
    );
  }

  let pretext: JSX.Element;
  if (outcome === EMPTY_OUTCOME) {
    pretext = <p>{scenario.prelude}</p>;
  } else /* need to retry */ {
    pretext = <p>{outcome.text}</p>;
  }

  const numAttemptsLeft = props.decision.choice.numAttempts - props.decision.outcomes.length;
  const header = <p className="center"><strong>{choice.difficulty} {choice.persona} {choice.skill} ({numAttemptsLeft} {(numAttemptsLeft > 1) ? 'Attempts' : 'Attempt'} Left)</strong></p>

  let controls: JSX.Element;
  console.log(outcome);
  console.log('vs');
  console.log(scenario);
  if (outcome.type === 'SUCCESS' || outcome.type === 'FAILURE' || outcome.type === 'INTERRUPTED') {
    controls = <Button onClick={() => props.onEnd()}>Next</Button>;
  } else {
    controls = (
      <span>
        <Button onClick={() => props.onRoll(props.node, props.settings, props.decision, 18, props.seed)}>{roll} ≥ 17</Button>
        <Button onClick={() => props.onRoll(props.node, props.settings, props.decision, 14, props.seed)}>{roll} 13 - 16</Button>
        <Button onClick={() => props.onRoll(props.node, props.settings, props.decision, 10, props.seed)}>{roll} 9 - 12</Button>
        <Button onClick={() => props.onRoll(props.node, props.settings, props.decision, 6, props.seed)}>{roll} 5 - 8</Button>
        <Button onClick={() => props.onRoll(props.node, props.settings, props.decision, 2, props.seed)}>{roll} ≤ 4</Button>
      </span>
    );
  }

  // TODO different for first retry
  let title: string;
  if (props.decision.outcomes.length > 0 && outcome.type === 'RETRY') {
    title = 'Resolve';
  } else {
    title = {
      'SUCCESS': 'Success!',
      'FAILURE': 'Failure',
      'INTERRUPTED': 'Interrupted',
      'RETRY': 'Lend a Hand',
    }[outcome.type] || 'Resolve';
  }

  return (
    <Card title={title} theme="dark" inQuest={true}>
      {outcome.type === 'RETRY' && header}
      {pretext}
      {inst}
      {controls}
    </Card>
  );
}

const Decision = (props: DecisionProps, theme: CardThemeType = 'light'): JSX.Element => {
  switch(props.card.phase) {
    case 'PREPARE_DECISION':
      return renderPrepareDecision(props);
    case 'DECISION_TIMER':
      return renderDecisionTimer(props);
    case 'RESOLVE_DECISION':
      return renderResolveDecision(props);
    default:
      throw new Error('Unknown decision phase ' + props.card.phase);
  }
};

export default Decision;
