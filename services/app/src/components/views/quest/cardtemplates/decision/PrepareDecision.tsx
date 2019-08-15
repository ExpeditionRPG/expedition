import Button from 'app/components/base/Button';
import Card from 'app/components/base/Card';
import * as React from 'react';
import {formatImg, generateIconElements} from '../Render';
import {ParserNode} from '../TemplateTypes';
import {StateProps} from './Types';

export interface DispatchProps {
  onStartTimer: (node: ParserNode) => void;
}

export interface Props extends StateProps, DispatchProps {}

export default function prepareDecision(props: Props): JSX.Element {

  const prelude: JSX.Element[] = [];
  let i = 0;
  props.node.loopChildren((tag, c) => {
    if (tag !== 'event' && tag !== 'e') {
      prelude.push(<span key={i++}>{generateIconElements(c.toString(), 'light')}</span>);
    }
  });

  // Note: similar help text in renderNoTimer()
  let helpText: JSX.Element = (<span></span>);
  if (props.settings.showHelp) {
    helpText = (
      <div>
        <h2>
          Skill Check <img className="inline_icon" src={'images/' + formatImg('skill', props.theme) + '.svg'}></img>
        </h2>
        <p>
          You must choose between three actions, then roll to see if your choice succeeds.
        </p>
        <p>
          Each action has a skill type. You get bonuses for your levels in skills of those types, and for matching the persona type.
        </p>
        <ol>
          <li>
            <strong>Keep</strong> your skill and persona cards within sight.
          </li>
          <li><strong>Start</strong> the timer.</li>
          <li><strong>Tap</strong> one of the choices on the timer phase.</li>
          <li><strong>Be careful!</strong> If the timer runs out, your skill check becomes more difficult.</li>
        </ol>
      </div>
    );
  }

  return (
    <Card title="Skill Check" inQuest={true} theme={props.theme}>
      {prelude}
      {helpText}
      <Button className="bigbutton" onClick={() => props.onStartTimer(props.node)}>Begin Skill Check</Button>
    </Card>
  );
}
