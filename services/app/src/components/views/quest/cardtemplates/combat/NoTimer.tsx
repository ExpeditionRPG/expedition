import Button from 'app/components/base/Button';
import Card from 'app/components/base/Card';
import {SettingsType} from 'app/reducers/StateTypes';
import * as React from 'react';
import {ParserNode} from '../TemplateTypes';
import {isSurgeNextRound} from './Actions';
import {StateProps as StatePropsBase} from './Types';

export interface StateProps extends StatePropsBase {
  seed: string;
}

export interface DispatchProps {
  onTimerStop: (node: ParserNode, settings: SettingsType, elapsedMillis: number, surge: boolean, seed: string) => void;
}

export interface Props extends StateProps, DispatchProps {}

export default function noTimer(props: Props): JSX.Element {
  // Note: similar help text in renderPrepareTimer()
  const surge = isSurgeNextRound(props.node.ctx.templates.combat);
  let helpText: JSX.Element = (<span></span>);
  if (props.settings.showHelp) {
    helpText = (
      <div>
        {props.settings.numLocalPlayers === 1 && <p><strong>Solo play:</strong> Play as both adventurers, keeping each of their draw and discard piles separate.</p>}
        <ol>
          <li>
            <strong>Shuffle</strong> your ability draw pile.
            <ul>
              <li>Keep abilities played this combat in a separate discard pile.</li>
              <li><strong>If you run out of ability cards to draw</strong>, shuffle your discards into a new draw pile and continue drawing.</li>
            </ul>
          </li>
          <li><strong>No timer:</strong> Draw three abilities from your draw pile and play one ability.</li>
          <li>Once everyone has selected their ability, tap next.</li>
        </ol>
      </div>
    );
  }

  return (
    <Card title="Select Ability" theme="dark" inQuest={true}>
      {helpText}
      <Button
        className="bigbutton"
        onClick={() => props.onTimerStop(props.node, props.settings, 0, surge, props.seed)}
      >
        Next
      </Button>
    </Card>
  );
}
