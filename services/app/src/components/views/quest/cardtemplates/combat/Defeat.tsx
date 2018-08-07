import Button from 'app/components/base/Button';
import Card from 'app/components/base/Card';
import {SettingsType} from 'app/reducers/StateTypes';
import * as React from 'react';
import {ParserNode} from '../TemplateTypes';
import {CombatState} from './Types';

export interface StateProps {
  combat: CombatState;
  mostRecentRolls?: number[];
  node: ParserNode;
  settings: SettingsType;
}

export interface DispatchProps {
  onRetry: () => void;
  onCustomEnd: () => void;
  onEvent: (node: ParserNode, event: string) => void;
}

export interface Props extends StateProps, DispatchProps {}

export default function defeat(props: Props): JSX.Element {
  const helpfulHints = [
    <p>Remember, you can adjust combat difficulty at any time in the settings menu (in the top right).</p>,
    <p>Don't forget! Healing abilities and loot can be used on all adventurers, even those at 0 health.</p>,
    <p>Tip: battles are not won by healing, but by defeating the enemy.</p>,
    <p>Want to deal more damage? Look for combinations in your abilities - two adventurers working together can often do more damage than two alone.</p>,
  ];

  // Always show a helpful hint here - it's not getting in the way like other help text might
  // and it's a good opportunity to mitigate a potentially bad user experience
  // Use a random number in the state to keep it consistent / not change on new render events
  const helpText = props.mostRecentRolls && helpfulHints[props.mostRecentRolls[0] % helpfulHints.length];

  // If onLose is just an **end**, offer a retry button
  let retryButton = <span></span>;
  if (props.combat && !props.combat.custom) {
    const nextNode = props.node.handleAction('lose');
    if (nextNode && nextNode.isEnd()) {
      retryButton = <Button onClick={() => props.onRetry()}>Retry (heal to full)</Button>;
    }
  }

  return (
    <Card title="Defeat" theme="dark" inQuest={true}>
      <p>Your party was defeated.</p>
      {props.settings.showHelp && <p>Shuffle all of your ability cards back into your ability draw pile.</p>}
      {helpText}
      {retryButton}
      <Button onClick={() => (props.combat.custom) ? props.onCustomEnd() : props.onEvent(props.node, 'lose')}>Next</Button>
    </Card>
  );
}
