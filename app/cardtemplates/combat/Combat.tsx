import * as React from 'react'

import Button from '../../components/base/Button'
import Card from '../../components/base/Card'
import Picker from '../../components/base/Picker'
import TimerCard from '../../components/base/TimerCard'
import theme from '../../Theme'
import {MAX_ADVENTURER_HEALTH, REGEX} from '../../Constants'
import {encounters} from '../../Encounters'
import {isSurgeNextRound} from './Actions'
import {SettingsType, CardState, CardName} from '../../reducers/StateTypes'
import {ParserNode} from '../../parser/Node'
import {QuestContext, EventParameters, Enemy, Loot} from '../../reducers/QuestTypes'
import {CombatState, CombatPhase} from './State'
import Roleplay from '../roleplay/Roleplay'

export interface CombatStateProps extends CombatState {
  card: CardState;
  settings: SettingsType;
  maxTier?: number;
  node: ParserNode;
  victoryParameters?: EventParameters;
}

export interface CombatDispatchProps {
  onNext: (phase: CombatPhase) => void;
  onDefeat: (node: ParserNode, settings: SettingsType, maxTier: number) => void;
  onVictory: (node: ParserNode, settings: SettingsType, maxTier: number) => void;
  onTimerStop: (node: ParserNode, settings: SettingsType, elapsedMillis: number, surge: boolean) => void;
  onReturn: () => void;
  onTierSumDelta: (node: ParserNode, current: number, delta: number) => void;
  onAdventurerDelta: (node: ParserNode, settings: SettingsType, current: number, delta: number) => void;
  onEvent: (node: ParserNode, event: string) => void;
  onCustomEnd: () => void;
  onChoice: (settings: SettingsType, parent: ParserNode, index: number) => void;
  onSurgeNext: (node: ParserNode) => void;
}

export interface CombatProps extends CombatStateProps, CombatDispatchProps {};

const numerals: {[k: number]: string;} = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
};

function renderSelectTier(props: CombatProps): JSX.Element {
  return (
    <Card title="Draw Enemies" theme="DARK" inQuest={true}>
      <Picker label="Tier Sum" onDelta={(i: number)=>props.onTierSumDelta(props.node, props.tier, i)} value={props.tier}>
        Set this to the combined tier you wish to fight.
      </Picker>
      <Button onTouchTap={() => props.onNext('PREPARE')} disabled={props.tier <= 0}>Next</Button>
    </Card>
  );
}

function renderDrawEnemies(props: CombatProps): JSX.Element {
  let repeatEnemy = false;
  let uniqueEnemy = false;
  const enemyNames: Set<string> = new Set();
  const enemies: JSX.Element[] = props.enemies.map((enemy: Enemy, index: number) => {
    uniqueEnemy = uniqueEnemy || !enemy.class;
    let icon = null;
    if (enemy.class) {
      const iconName = enemy.class.replace(REGEX.HTML_TAG, '').toLowerCase();
      icon = <img className="inline_icon" src={`images/${iconName}_white_small.svg`} />;
    }
    if (enemyNames.has(enemy.name)) {
      repeatEnemy = true;
    } else {
      enemyNames.add(enemy.name);
    }
    return (
      <h2 className="combat draw_enemies center" key={index}>
        {enemy.name} <span className="meta">(Tier {numerals[enemy.tier]} {icon})</span>
      </h2>
    );
  });

  let helpText: JSX.Element = <span></span>;
  if (props.settings.showHelp) {
    helpText = (
      <div>
        <p>Draw the enemies listed above.</p>
        <ul>
          {repeatEnemy && <li>Draw extra cards of the appropriate class for the duplicate enemies, and track health using the card backs.</li>}
          {uniqueEnemy && <li>Draw cards of any class for enemies without class icons. Track health using the back.</li>}
        </ul>
        <p>Place these cards in the center and put tokens on their maximum health.</p>
      </div>
    );
  }

  return (
    <Card title="Draw Enemies" theme="DARK" inQuest={true}>
      <p>
        Prepare to Fight:
      </p>
      {enemies}
      {helpText}
      <Button onTouchTap={() => props.onNext('PREPARE')}>Next</Button>
    </Card>
  );
}

function renderPrepare(props: CombatProps): JSX.Element {
  let helpText: JSX.Element = (<span></span>);
  if (props.settings.showHelp) {
    helpText = (
      <ol>
        <li>Shuffle your ability draw pile.
          <ul>
            <li>Keep abilities played this combat in a separate discard pile.</li>
            <li>If you run out of abilities to draw, shuffle in your discard pile.</li>
          </ul>
        </li>
        <li>Pre-draw three abilities face down.</li>
        <li>Start the timer.</li>
        <li>Look at your hand and play one ability.</li>
        {props.settings.multitouch && <li>Place your finger on the screen.</li>}
        {props.settings.multitouch && <li>When all fingers are down, the timer stops.</li>}
        {!props.settings.multitouch && <li>Once everyone has selected an ability, tap the screen to stop the timer.</li>}
        <li>If the timer runs out, you'll take additional damage.</li>
      </ol>
    );
  }

  return (
    <Card title="Prepare for Combat" theme="DARK" inQuest={true}>
      {helpText}
      <Button className="bigbutton" onTouchTap={() => props.onNext('TIMER')}>Start Timer</Button>
    </Card>
  );
}

function renderSurge(props: CombatProps): JSX.Element {
  let helpText: JSX.Element = (<span></span>);
  if (props.settings.showHelp) {
    helpText = (
      <span>
        <p>
          Immediately follow the surge action listed on all remaining encounter cards. Some encounters' surges may also apply after they've been killed.
        </p>
        <p>
          Surge effects happen before abilities. Abilities that apply "this round" do not affect surges (however, loot may still be used during a surge). If you are killed during a surge, do not resolve your abilities.
        </p>
      </span>
    );
  }
  return (
    <Card title="Enemy Surge!"
      theme="RED"
      inQuest={true}
      onReturn={() => props.onReturn()}
    >
      <h3>An enemy surge occurs!</h3>
      {helpText}
      <Button onTouchTap={() => props.onSurgeNext(props.node)}>Next</Button>
    </Card>
  );
}

function renderResolve(props: CombatProps): JSX.Element {
  let helpText: JSX.Element = (<p>Resolve all played abilities.</p>);
  if (props.settings.showHelp) {
    helpText = (
      <span>
        <p>
          Each adventurer rolls a die for the ability they played. If <img className="inline_icon" src="images/roll_white_small.svg"></img> &ge; X, the ability succeeds. Abilities may list additional effects based on the roll, even if they fail.
        </p>
        <p>
          Adventurers may resolve their abilities in any order, and may apply their effects (such as roll and damage modifiers) retroactively to other abilities used this round.
        </p>
        <p>
          Note that some enemies take more or less damage from certain ability types, as specified on their card.
        </p>
        <p>
          Discard all abilities played this round.
        </p>
      </span>
    );
  }
  let renderedRolls: JSX.Element[] = null;
  if (props.settings.autoRoll && props.mostRecentRolls) {
    renderedRolls = props.mostRecentRolls.map((roll: number, index: number) => {
      return (<div className="roll" key={index}>{roll}</div>);
    });
  }

  return (
    <Card title="Roll &amp; Resolve" theme="DARK" inQuest={true} onReturn={() => props.onReturn()}>
      {helpText}
      {renderedRolls &&
        <div>
          {props.settings.showHelp && <p>Resolve your abilities with the following rolls. Start with the last person to read the quest and go clockwise:</p>}
          <div className="rolls">{renderedRolls}</div>
        </div>
      }
      <Button onTouchTap={() => props.onNext('ENEMY_TIER')}>Next</Button>
    </Card>
  );
}

function renderEnemyTier(props: CombatProps): JSX.Element {
  return (
    <Card title="Enemy Strength" theme="DARK" inQuest={true}>
      <Picker label="Tier Sum" onDelta={(i: number)=>props.onTierSumDelta(props.node, props.tier, i)} value={props.tier}>
        Set this to the combined tier of the remaining enemies. You are victorious when this reaches zero.
      </Picker>

      <Button onTouchTap={() => props.onVictory(props.node, props.settings, props.maxTier)}>Victory (Tier = 0)</Button>
      <Button onTouchTap={() => props.onNext('PLAYER_TIER')} disabled={props.tier <= 0}>Next</Button>
    </Card>
  );
}

function renderPlayerTier(props: CombatProps): JSX.Element {
  let helpText: JSX.Element = (<span></span>);
  const damage = (props.mostRecentAttack) ? props.mostRecentAttack.damage : -1;

  if (props.settings.showHelp) {
    helpText = (
      <span>
        <p>Slide your Adventurer health down {damage} space{damage > 1 ? 's' : ''}.</p>
        <p>If you reach zero health, you are knocked out. After resolving this turn, you cannot play further cards until you are healed by another adventurer or revived at the end of the encounter.</p>
      </span>
    );
  }

  return (
    <Card title="Take Damage" theme="DARK" inQuest={true}>
      <h3 className="combat center">All adventurers:</h3>
      <h3 className="combat center">{damage} Damage</h3>

      {helpText}

      <Picker label="Adventurers" onDelta={(i: number)=>props.onAdventurerDelta(props.node, props.settings, props.numAliveAdventurers, i)} value={props.numAliveAdventurers}>
        Set this to the number of adventurers above zero health. You are defeated when this reaches zero.
      </Picker>

      <Button onTouchTap={() => props.onDefeat(props.node, props.settings, props.maxTier)}>Defeat (Adventurers = 0)</Button>
      <Button onTouchTap={() => props.onNext('PREPARE')} disabled={props.numAliveAdventurers <= 0}>Next</Button>
    </Card>
  );
}

function renderVictory(props: CombatProps): JSX.Element {
  const contents: JSX.Element[] = [];

  if (props.victoryParameters) {
    if (props.victoryParameters.heal > 0 && props.victoryParameters.heal < MAX_ADVENTURER_HEALTH) {
      contents.push(<p key="c1">All adventurers (even if at 0 health) heal <strong>{props.victoryParameters.heal}</strong> health.</p>);
    } else if (props.victoryParameters.heal === 0) {
      contents.push(<p key="c1">Adventurers <strong>do not heal</strong>.</p>);
    } else {
      contents.push(<p key="c1">All adventurers (even if at 0 health) heal to <strong>full</strong> health.</p>);
    }

    // TODO improved leveling up: https://github.com/Fabricate-IO/expedition-app/issues/226
    if (props.victoryParameters.xp !== false && props.levelUp) {
      contents.push(<p key="c2">Each Adventurer may learn a new ability:</p>);
      if (props.settings.showHelp) {
        contents.push(
          <ul key="c3">
            <li>You <strong>may</strong> choose to discard an ability.</li>
            <li>Draw 3 abilities from one of the decks listed on your adventurer card.</li>
            <li>Add 1 to your ability deck, and place the remaining 2 at the bottom of the deck you drew from.</li>
          </ul>
        );
      }
    }

    if (props.victoryParameters.loot !== false && props.loot && props.loot.length > 0) {
      contents.push(
        <p key="c4">The party draws the following loot:</p>
      );
      const renderedLoot = props.loot.map((loot: Loot, index: number) => {
        return (<li key={index}><strong>{capitalizeFirstLetter(numberToWord(loot.count))} tier {numerals[loot.tier]} loot</strong></li>)
      });
      contents.push(<ul key="c5">{renderedLoot}</ul>);

      if (props.settings.showHelp) {
        contents.push(
          <span key="c6">
            <p>Loot should be divided amongst Adventurers now. It can be used at any time and does not cost an action (unless otherwise specified).</p>
          </span>
        );
      }
    }
  }

  return (
    <Card title="Victory" theme="DARK" inQuest={true}>
      {contents}
      <Button onTouchTap={() => (props.custom) ? props.onCustomEnd() : props.onEvent(props.node, 'win')}>Next</Button>
    </Card>
  );
}

function renderDefeat(props: CombatProps): JSX.Element {
  let helpText = <span></span>;
  if (props.settings.showHelp) {
    helpText = <p>Remember, you can adjust combat difficulty at any time in the settings menu at the top right of the app.</p>
  }

  return (
    <Card title="Defeat" theme="DARK" inQuest={true}>
      <p>Your party was defeated.</p>
      {helpText}
      <Button onTouchTap={() => (props.custom) ? props.onCustomEnd() : props.onEvent(props.node, 'lose')}>Next</Button>
    </Card>
  );
}

function renderTimerCard(props: CombatProps): JSX.Element {
  const surge = isSurgeNextRound(props.node);
  const surgeWarning = (props.settings.difficulty === 'EASY' && surge) ? 'Surge Imminent' : null;
  let instruction = null;
  if (props.settings.showHelp) {
    if (props.settings.numPlayers > 1) {
      if (props.settings.multitouch) {
        instruction = 'All players: hold one finger once you play an ability';
      } else {
        instruction = 'Tap the screen once all players have played an ability';
      }
    } else {
      instruction = 'Tap the screen once you\'ve played an ability for each adventurer';
    }
  }

  return (
    <TimerCard
      theme="DARK"
      secondaryText={surgeWarning}
      tertiaryText={instruction}
      numPlayers={(props.settings.multitouch) ? props.numAliveAdventurers : 1}
      roundTimeTotalMillis={props.roundTimeMillis}
      onTimerStop={(ms: number) => props.onTimerStop(props.node, props.settings, ms, surge)} />
  );
}

function renderMidCombatRoleplay(props: CombatProps): JSX.Element {
  // Empty card to handle default case of no roleplay (happens when just starting into the RP section).
  if (!props.node.ctx.templates.combat.roleplay) {
    return (<Card title="" inQuest={true} theme="DARK"></Card>);
  }

  const roleplay = Roleplay({
    node: props.node.ctx.templates.combat.roleplay,
    settings: props.settings,
    onChoice: (settings: SettingsType, node: ParserNode, index: number) => {props.onChoice(settings, props.node, index)},
    onReturn: () => {props.onReturn()},
  }, 'DARK');
  return roleplay;
}

function numberToWord(input: number): string {
  switch (input) {
    case 0: return 'zero';
    case 1: return 'one';
    case 2: return 'two';
    case 3: return 'three';
    case 4: return 'four';
    case 5: return 'five';
    case 6: return 'six';
    case 7: return 'seven';
    case 8: return 'eight';
    case 9: return 'nine';
    case 10: return 'ten';
    default: return input.toString();
  }
}

function capitalizeFirstLetter(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

const Combat = (props: CombatProps): JSX.Element => {
  switch(props.card.phase) {
    case 'DRAW_ENEMIES':
      return (props.custom) ? renderSelectTier(props) : renderDrawEnemies(props);
    case 'PREPARE':
      return renderPrepare(props);
    case 'TIMER':
      return renderTimerCard(props);
    case 'SURGE':
      return renderSurge(props);
    case 'RESOLVE_ABILITIES':
      return renderResolve(props);
    case 'ENEMY_TIER':
      return renderEnemyTier(props);
    case 'PLAYER_TIER':
      return renderPlayerTier(props);
    case 'VICTORY':
      return renderVictory(props);
    case 'DEFEAT':
      return renderDefeat(props);
    case 'ROLEPLAY':
      return renderMidCombatRoleplay(props);
    default:
      throw new Error('Unknown combat phase ' + props.card.phase);
  }
}

export default Combat;
