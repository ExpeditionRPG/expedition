import AudioControlsContainer from 'app/components/base/AudioControlsContainer';
import Button from 'app/components/base/Button';
import Card from 'app/components/base/Card';
import Picker from 'app/components/base/Picker';
import {Enemy} from 'app/reducers/QuestTypes';
import * as React from 'react';
import {REGEX} from 'shared/Regex';
import {NUMERALS} from '../Render';
import {ParserNode} from '../TemplateTypes';
import {CombatPhase, CombatState} from './Types';
import {StateProps as StatePropsBase} from './Types';

export interface StateProps extends StatePropsBase {
  combat: CombatState;
  tier: number;
}

export interface DispatchProps {
  onNext: (phase: CombatPhase) => void;
  onTierSumDelta: (node: ParserNode, current: number, delta: number) => void;
}

export interface Props extends StateProps, DispatchProps {}

export default function drawEnemies(props: Props): JSX.Element {
  const nextCard = (props.settings.timerSeconds) ? 'PREPARE' : 'NO_TIMER';

  // Show a tier picker if this is a custom combat
  if (props.combat.custom) {
    return (
      <Card title="Draw Enemies" theme="dark" inQuest={true}>
        <Picker
          label="Tier Sum"
          id="tier_sum"
          onDelta={(i: number) => props.onTierSumDelta(props.node, props.tier, i)}
          value={props.tier}>
          Set this to the combined tier you wish to fight.
        </Picker>
        <Button onClick={() => props.onNext(nextCard)} disabled={props.tier <= 0}>Next</Button>
        <AudioControlsContainer />
      </Card>
    );
  }

  let repeatEnemy = false;
  let uniqueEnemy = false;
  const enemyNames: Set<string> = new Set();
  const oneEnemy = (props.combat.enemies.length === 1);
  const enemies: JSX.Element[] = props.combat.enemies.map((enemy: Enemy, index: number) => {
    uniqueEnemy = uniqueEnemy || !enemy.class;
    let icon = null;
    if (enemy.class) {
      const iconName = enemy.class.replace(new RegExp(REGEX.HTML_TAG.source, 'g'), '').toLowerCase();
      icon = <img className="inline_icon" src={`images/${iconName}_white_small.svg`} />;
    }
    if (enemyNames.has(enemy.name)) {
      repeatEnemy = true;
    } else {
      enemyNames.add(enemy.name);
    }
    return (
      <h2 className="combat draw_enemies center" key={index}>
        {enemy.name} <span className="meta">(Tier {NUMERALS[enemy.tier]} {icon})</span>
      </h2>
    );
  });

  let helpText: JSX.Element = <span></span>;
  if (props.settings.showHelp) {
    helpText = (
      <div>
        <p>
          Draw the enemy {oneEnemy ? 'card' : 'cards'} listed above and place {oneEnemy ? 'it' : 'them'} in the center of the table.
          Put {oneEnemy ? 'a token on the largest number on its health tracker' : 'tokens on the largest numbers on their health trackers'}.
        </p>
        {repeatEnemy && <p><strong>Duplicate enemies:</strong> Draw extra cards of the appropriate class and track health using the card backs.</p>}
        {uniqueEnemy && <p><strong>Custom enemies (no icon):</strong> Draw a random card of the listed tier (of any class). If health is specified, track it using the back of the card and ignore all card-specific surges and effects. Otherwise, use the front of the card, starting at full health.</p>}
      </div>
    );
  }

  return (
    <Card title="Draw Enemies" theme="dark" inQuest={true}>
      <p>
        Prepare to Fight:
      </p>
      {enemies}
      {helpText}
      <Button onClick={() => props.onNext(nextCard)}>Next</Button>
      <AudioControlsContainer />
    </Card>
  );
}
