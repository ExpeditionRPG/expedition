import Button from 'app/components/base/Button';
import Card from 'app/components/base/Card';
import {CardPhase, CardThemeType, MultiplayerState, SettingsType} from 'app/reducers/StateTypes';
import * as pluralize from 'pluralize';
import * as React from 'react';
import {Outcome} from 'shared/schema/templates/Decision';
import {generateIconElements} from '../Render';
import {ParserNode} from '../TemplateTypes';
import {computeOutcome, computeSuccesses, skillTimeMillis} from './Actions';
import DecisionTimer from './DecisionTimer';
import {DecisionState, LeveledSkillCheck} from './Types';

export interface StateProps {
  phase: CardPhase;
  decision: DecisionState;
  multiplayerState: MultiplayerState;
  node: ParserNode;
  seed: string;
  settings: SettingsType;
}

export interface DispatchProps {
  onStartTimer: () => void;
  onSelect: (node: ParserNode, selected: LeveledSkillCheck, elapsedMillis: number) => void;
  onRoll: (node: ParserNode, roll: number) => void;
  onEnd: () => void;
}

export interface Props extends StateProps, DispatchProps {}

export function renderPrepareDecision(props: Props, theme: CardThemeType): JSX.Element {

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
    <Card title="Skill Check" inQuest={true} theme={theme}>
      {prelude}
      {helpText}
      <Button className="bigbutton" onClick={() => props.onStartTimer()}>Begin Skill Check</Button>
    </Card>
  );
}

export function renderDecisionTimer(props: Props, theme: CardThemeType): JSX.Element {
  return (
    <DecisionTimer
      theme={theme}
      checks={props.decision.leveledChecks}
      roundTimeTotalMillis={skillTimeMillis(props.settings, props.multiplayerState)}
      onSelect={(c: LeveledSkillCheck, ms: number) => props.onSelect(props.node, c, ms)} />
  );
}

export function renderResolveDecision(props: Props, theme: CardThemeType): JSX.Element {
  const selected = props.decision.selected;
  if (selected === null) {
    throw new Error('Expected selected value');
  }

  const inst: JSX.Element = (<span></span>);
  const outcome = computeOutcome(props.decision.rolls, selected, props.settings, props.multiplayerState);

  // TODO return early with generic cards for success/failure/interrupted. We're
  // only rendering resolve with these states if there isn't a valid one provided by
  // the parser node.

  const roll = <img className="inline_icon" src="images/roll_small.svg"></img>;
  const successes = computeSuccesses(props.decision.rolls, selected);
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

const Decision = (props: Props, theme: CardThemeType|{}): JSX.Element => {
  const resolvedTheme: CardThemeType = (typeof(theme) !== 'string') ? 'light' : theme;
  switch (props.phase) {
    case 'PREPARE_DECISION':
      return renderPrepareDecision(props, resolvedTheme);
    case 'DECISION_TIMER':
      return renderDecisionTimer(props, resolvedTheme);
    case 'RESOLVE_DECISION':
      return renderResolveDecision(props, resolvedTheme);
    default:
      throw new Error('Unknown decision phase ' + props.phase);
  }
};

export default Decision;
