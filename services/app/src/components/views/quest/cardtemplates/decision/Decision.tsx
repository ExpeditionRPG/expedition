import * as pluralize from 'pluralize';
import * as React from 'react';
import * as seedrandom from 'seedrandom';
import {Outcome} from 'shared/schema/templates/Decision';
import {CardState, CardThemeType, MultiplayerState, SettingsType} from '../../../../../reducers/StateTypes';
import Button from '../../../../base/Button';
import Callout from '../../../../base/Callout';
import Card from '../../../../base/Card';
import {numLocalAndMultiplayerAdventurers} from '../MultiplayerPlayerCount';
import {generateIconElements} from '../Render';
import {ParserNode} from '../TemplateTypes';
import {computeOutcome, generateChecks, skillTimeMillis} from './Actions';
import DecisionTimer from './DecisionTimer';
import {DecisionState, EMPTY_OUTCOME, LeveledSkillCheck, RETRY_THRESHOLD_MAP, SUCCESS_THRESHOLD_MAP} from './Types';

export interface DecisionStateProps {
  card: CardState;
  decision: DecisionState;
  multiplayerState: MultiplayerState;
  node: ParserNode;
  seed: string;
  settings: SettingsType;
}

export interface DecisionDispatchProps {
  onStartTimer: () => void;
  onSelect: (node: ParserNode, selected: LeveledSkillCheck, elapsedMillis: number) => void;
  onRoll: (node: ParserNode, roll: number) => void;
  onEnd: () => void;
}

export interface DecisionProps extends DecisionStateProps, DecisionDispatchProps {}

export function renderPrepareDecision(props: DecisionProps): JSX.Element {

  const prelude: JSX.Element[] = [];
  let i = 0;
  props.node.loopChildren((tag, c) => {
    if (tag !== 'event') {
      prelude.push(<span key={i++}>{generateIconElements(c.toString(), 'light')}</span>);
    }
  });

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
          <li><strong>Tap</strong> one of the choices on the timer phase. Each choice shows the number of attempts you can make, the difficulty or persona type, and the skill type of the check.</li>
          <li><strong>Be careful!</strong> If the timer runs out, your skill check becomes more difficult.</li>
        </ol>
      </div>
    );
  }

  return (
    <Card title="Skill Check" theme="dark" inQuest={true}>
      {prelude}
      {helpText}
      <Button className="bigbutton" onClick={() => props.onStartTimer()}>Begin Skill Check</Button>
    </Card>
  );
}

export function renderDecisionTimer(props: DecisionProps): JSX.Element {
  return (
    <DecisionTimer
      theme="dark"
      checks={props.decision.leveledChecks}
      roundTimeTotalMillis={skillTimeMillis(props.settings, props.multiplayerState)}
      onSelect={(c: LeveledSkillCheck, ms: number) => props.onSelect(props.node, c, ms)} />
  );
}

export function renderResolveDecision(props: DecisionProps): JSX.Element {
  const selected = props.decision.selected;
  if (selected === null) {
    return <span>TODO BETTER HANDLING</span>;
  }

  // Note: similar help text in renderNoTimer()
  const inst: JSX.Element = (<span></span>);

  const outcome = computeOutcome(props.decision.rolls, selected, props.settings, props.multiplayerState);
  /*
  TODO
  if (outcome.instructions.length > 0) {
    const elems = outcome.instructions.map((instruction: string, i: number) => {
      return <Callout key={i} icon="adventurer_white">{instruction}</Callout>;
    });
    inst = <span>{elems}</span>;
  } else if (props.settings.showHelp && outcome.type === 'RETRY') {
    inst = (
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
  */

  const TITLES: Record<keyof typeof Outcome, string> = {
    failure: 'Failure',
    interrupted: 'Interrupted',
    retry: 'Keep going!',
    success: 'Success!',
  };
  const title = (outcome) ? TITLES[outcome] : 'Resolve Check';

  const roll = <img className="inline_icon" src="images/roll_small.svg"></img>;
  // {selected.requiredSuccesses - successes} {pluralize('Success', successes)}
  return (
    <Card title={title} inQuest={true}>
      <p className="center">
        <strong>{selected.difficulty} {selected.persona} {selected.skill} (TODO successes Needed)</strong>
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

const Decision = (props: DecisionProps, theme: CardThemeType = 'light'): JSX.Element => {
  switch (props.card.phase) {
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
