import Button from 'app/components/base/Button';
import Card from 'app/components/base/Card';
import * as React from 'react';
import {StateProps} from './Types';

export interface DispatchProps {
  onTimerStart: () => void;
}

export interface Props extends StateProps, DispatchProps {}

export default function prepareTimer(props: Props): JSX.Element {
  // Note: similar help text in renderNoTimer()
  let helpText: JSX.Element = (<span></span>);
  if (props.settings.showHelp) {
    helpText = (
      <div>
        {props.settings.numPlayers === 1 && <p><strong>Solo play:</strong> Play as both adventurers, keeping each of their draw and discard piles separate.</p>}
        <ol>
          <li>
            <strong>Shuffle</strong> your ability draw pile.
            <ul>
              <li>Keep abilities played this combat in a separate discard pile.</li>
              <li><strong>If you run out of ability cards to draw</strong>, shuffle your discards into a new draw pile and continue drawing.</li>
            </ul>
          </li>
          <li><strong>Pre-draw</strong> your hand of three abilities face-down from your draw pile. Do not look at these cards until you start the timer.</li>
          <li><strong>Start</strong> the timer.</li>
          <li><strong>Play</strong> one ability from your hand.</li>
          {props.settings.multitouch && <li><strong>Place your finger</strong> on the screen. When all fingers are down, the timer stops.</li>}
          {!props.settings.multitouch && <li><strong>Tap the screen</strong> once everyone has selected their abilities to stop the timer.</li>}
          <li><strong>Act fast!</strong> If the timer runs out, you'll take more damage.</li>
        </ol>
      </div>
    );
  }

  return (
    <Card title="Prepare for Combat" theme="dark" inQuest={true}>
      {helpText}
      <Button className="bigbutton" onClick={() => props.onTimerStart()}>Start Timer</Button>
    </Card>
  );
}
