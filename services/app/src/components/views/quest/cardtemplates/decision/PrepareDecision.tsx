import Button from 'app/components/base/Button';
import Card from 'app/components/base/Card';
import {CardThemeType, SettingsType} from 'app/reducers/StateTypes';
import * as React from 'react';
import {generateIconElements} from '../Render';
import {ParserNode} from '../TemplateTypes';

export interface StateProps {
  node: ParserNode;
  settings: SettingsType;
}

export interface DispatchProps {
  onStartTimer: () => void;
}

export interface Props extends StateProps, DispatchProps {}

export default function prepareDecision(props: Props, theme: CardThemeType): JSX.Element {

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
