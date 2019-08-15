import {numPlayers} from 'app/actions/Settings';
import Button from 'app/components/base/Button';
import Card from 'app/components/base/Card';
import * as React from 'react';
import {formatImg} from '../Render';
import {StateProps} from './Types';

export interface DispatchProps {
  onTimerStart: () => void;
}

export interface Props extends StateProps, DispatchProps {}

export default function prepareTimer(props: Props): JSX.Element {
  // Note: similar help text in renderNoTimer()
  console.log('rendering prepare timer');
  console.log(props.settings);
  const solo = numPlayers(props.settings) === 1;
  console.log(solo);
  let helpText: JSX.Element = (<span></span>);
  if (props.settings.showHelp) {
    helpText = (
      <div>
        {solo && <p><strong>Solo play:</strong> Play as both adventurers, keeping each of their draw and discard piles separate.</p>}
        <h2>Shuffle & Draw <img className="inline_icon" src={'images/' + formatImg('cards', props.theme) + '.svg'}></img></h2>
          <p><strong>Shuffle</strong> your ability draw pile.</p>
          <ul>
            <li>Keep abilities played this combat in a separate discard pile.</li>
            <li><strong>If you run out of ability cards to draw</strong>, shuffle your discards into a new draw pile and continue drawing.</li>
          </ul>
          <p><strong>Pre-draw</strong> your hand of three abilities face-down from your draw pile. Do not look at these cards until you start the timer.</p>
          <h2>Play Quickly <img className="inline_icon" src={'images/' + formatImg('compass', props.theme) + '.svg'}></img></h2>
          <p><strong>Start</strong> the timer.</p>
          <p><strong>Play</strong> one ability from your hand.</p>
          {props.settings.multitouch && <p><strong>Place your finger</strong> on the screen. When all fingers are down, the timer stops.</p>}
          {!props.settings.multitouch && <p><strong>Tap the screen</strong> once everyone has selected their abilities to stop the timer.</p>}
          <p><strong>Act fast!</strong> If the timer runs out, you'll take more damage.</p>
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
