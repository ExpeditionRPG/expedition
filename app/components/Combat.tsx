import * as React from 'react'
import Card from './base/Card'
import Button from './base/Button'
import theme from '../theme'
import {isSurgeRound} from '../reducers/combat'
import {XMLElement, SettingsType} from '../reducers/StateTypes'
import {CombatPhaseNameType, MidCombatPhase, EndCombatPhase, CombatState, Enemy, Loot} from '../reducers/QuestTypes'
import TimerCard from './base/TimerCard'
import Picker from './base/Picker'

export interface CombatStateProps {
  node: XMLElement;
  combat: CombatState;
  maxTier: number;
  settings: SettingsType;
  icon: string;
}

export interface CombatDispatchProps {
  onNext: (phase: CombatPhaseNameType) => void;
  onDefeat: () => void;
  onVictory: (maxTier: number, settings: SettingsType) => void;
  onTimerStop: (elapsedMillis: number, surge: boolean) => void;
  onPostTimerReturn: () => void;
  onTierSumDelta: (delta: number) => void;
  onAdventurerDelta: (delta: number) => void;
  onEvent: (node: XMLElement, event: string) => void;
}

export interface CombatProps extends CombatStateProps, CombatDispatchProps {};

const numerals: {[k: number]: string;} = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
};

function renderDrawEnemies(props: CombatProps): JSX.Element {
  let enemies: JSX.Element[] = props.combat.enemies.map(function(enemy: Enemy, index: number) {
    return (
      <div key={index}>{enemy.name} (Tier {numerals[enemy.tier]})</div>
    );
  });

  let helpText: JSX.Element = <span></span>;
  if (props.settings.showHelp) {
    helpText = (
      <p>
        Draw the enemies listed above. Place in the center and put tokens on their maximum Health.
      </p>
    );
  }

  return (
    <Card title='Draw Enemies' dark={true}>
      <p>
        Prepare to Fight:
      </p>
      {enemies}
      {helpText}
      <Button dark={true} onTouchTap={() => props.onNext('PREPARE')}>Next</Button>
    </Card>
  );
}

function renderPrepare(props: CombatProps): JSX.Element {
  let helpText: JSX.Element = (<span></span>);
  if (props.settings.showHelp) {
    helpText = (
      <span>
        <p>Shuffle ALL of your abilities back into your deck.</p>
        <p>Draw - but don't look at - the top 3 abilities.</p>
        <p>When you begin combat:</p>
        <ul>
          <li>Look at your hand of 3 cards and play one face up on the table.</li>
          <li>Place your finger on the screen.</li>
          <li>When all fingers are down, the timer will stop.</li>
          <li>The longer you take, the more chances the enemy will have to attack you.</li>
        </ul>
      </span>
    );
  }

  return (
    <Card title='Prepare for Combat' dark={true}>
      {helpText}
      <h2 style={{textAlign: 'center'}}>Ready to begin?</h2>
      <Button dark={true} onTouchTap={() => props.onNext('TIMER')}>Start Timer</Button>
    </Card>
  );
}

function renderSurge(props: CombatProps): JSX.Element {
  let helpText: JSX.Element = (<span></span>);
  if (props.settings.showHelp) {
    helpText = (
      <span>
        <p>
          Immediately follow the surge action listed on all remaining Encounter cards. Some Encounters' surges may also apply after they've been killed.
        </p>
        <p>
          Surge effects happen before abilities. Abilities that apply "this round" do not affect surges (however, Loot may still be used during a surge). If you are killed during a surge, do not resolve your abilities.
        </p>
      </span>
    );
  }
  return (
    <Card title='Enemy Surge!' dark={true} onReturn={props.onPostTimerReturn}>
      <h3>An enemy surge occurs!</h3>
      {helpText}
      <Button dark={true} onTouchTap={() => props.onNext('RESOLVE_ABILITIES')}>Next</Button>
    </Card>
  );
}

function renderResolve(props: CombatProps): JSX.Element {
  let helpText: JSX.Element = (<p>Resolve all played abilities.</p>);
  if (props.settings.showHelp) {
    helpText = (
      <span>
        <p>
          Roll a die for each ability with a "<img style={theme.inlineIcon} src="../images/roll_white_small.svg"></img> &gt; X" and resolve the cards' effects.
        </p>
        <p>
          Adventurers may resolve their abilities in any order, and may apply the effects of their abilities (such as roll modifiers) retroactively to other abilities used this round.
        </p>
      </span>
    );
  }
  return (
    <Card title='Roll & Resolve' dark={true} onReturn={props.onPostTimerReturn}>
      {helpText}
      <Button dark={true} onTouchTap={() => props.onNext('ENEMY_TIER')}>Next</Button>
    </Card>
  );
}

function renderEnemyTier(props: CombatProps): JSX.Element {
  return (
    <Card title='Enemy Strength' dark={true}>
      <Picker label="Tier Sum" dark={true} onDelta={(i: number)=>props.onTierSumDelta(i)} value={props.combat.tier}>
        Set this to the combined tier of the remaining enemies. You are victorious when this reaches zero.
      </Picker>

      <Button dark={true} onTouchTap={() => props.onVictory(props.maxTier, props.settings)} disabled={props.combat.tier > 0}>End Encounter (Victory)</Button>
      <Button dark={true} onTouchTap={() => props.onNext('PLAYER_TIER')} disabled={props.combat.tier <= 0}>Next</Button>
    </Card>
  );
}

function renderPlayerTier(props: CombatProps): JSX.Element {
  var helpText: JSX.Element = (<span></span>);
  var mostRecentAttack = props.combat.mostRecentAttack;
  var damage = (mostRecentAttack) ? mostRecentAttack.damage : -1;

  if (props.settings.showHelp) {
    helpText = (
      <span>
        <p>Slide your Adventurer health down {damage} space(s).</p>
        <p>If you reach zero health, you are knocked out. After you resolve this turn, you cannot play further cards until the end of the Encounter.</p>
      </span>
    );
  }

  return (
    <Card title='Take Damage' dark={true}>
      <h3 style={{textAlign: 'center'}}>All adventurers:</h3>
      <h3 style={{textAlign: 'center'}}>{damage} Damage</h3>

      {helpText}

      <Picker label="Adventurers" dark={true} onDelta={(i: number)=>props.onAdventurerDelta(1)} value={props.combat.numAliveAdventurers}>
        Set this to the number of adventurers still fighting. You are defeated when this reaches zero.
      </Picker>

      <Button dark={true} onTouchTap={() => props.onDefeat()} disabled={props.combat.numAliveAdventurers > 0}>End Encounter (Defeat)</Button>
      <Button dark={true} onTouchTap={() => props.onNext('PREPARE')} disabled={props.combat.numAliveAdventurers <= 0}>Next</Button>
    </Card>
  );
}

function renderVictory(props: CombatProps): JSX.Element {
  var contents: JSX.Element[] = [];

  if (props.settings.showHelp) {
    contents.push(
      <p key="c1">
        <strong>All adventurers heal to full health.</strong>
      </p>
    );
  }

  if (props.combat.levelUp) {
    contents.push(
      <p key="c2">
        You feel more knowledgeable! Each Adventurer may learn a new ability at this time:
      </p>
    );
    if (props.settings.showHelp) {
      contents.push(
        <ul key="c3">
          <li>You may discard one of your current abilities.</li>
          <li>Draw 3 Ability cards from one of the decks listed on your Adventurer card.</li>
          <li>Choose 1 of these cards and insert it into your ability deck.</li>
          <li>Place the remaining 2 cards at the bottom of the deck you drew from.</li>
        </ul>
      );
    }
  }

  contents.push(
    <p key="c4">
      <strong>The party draws the following Loot:</strong>
    </p>
  );

  let renderedLoot: JSX.Element[] = props.combat.loot.map(function(loot: Loot, index: number) {
    return (<li key={index}><strong>Draw {loot.count} Tier {numerals[loot.tier]} Loot</strong></li>)
  });

  contents.push(<ul key="c5">{renderedLoot}</ul>);

  if (props.settings.showHelp) {
    contents.push(
      <span key="c6">
        <p>Loot drawn at the end of an Encounter is for the entire party. It may either be divided amongst Adventurers or kept in a shared Loot pile.</p>
        <p>Loot can be used at any time and does not cost an action (unless otherwise specified).</p>
      </span>
    );
  }

  return (
    <Card title='Victory' dark={true}>
      {contents}
      <Button dark={true} onTouchTap={() => props.onEvent(props.node, 'win')}>Next</Button>
    </Card>
  );
}

function renderDefeat(props: CombatProps): JSX.Element {
  return (
    <Card title='Defeat' dark={true}>
      Your party was defeated.
      <Button dark={true} onTouchTap={() => props.onEvent(props.node, 'lose')}>Next</Button>
    </Card>
  );
}

const Combat = (props: CombatProps): JSX.Element => {
  switch(props.combat.phase) {
    case 'DRAW_ENEMIES':
      return renderDrawEnemies(props);
    case 'PREPARE':
      return renderPrepare(props);
    case 'TIMER':
      let surge: boolean = isSurgeRound(props.combat);
      return (
        <TimerCard
          dark={true}
          surgeWarning={surge}
          numPlayers={(props.settings.multitouch) ? props.combat.numAliveAdventurers : 1}
          roundTimeTotalMillis={props.combat.roundTimeMillis}
          onTimerStop={(ms: number) => props.onTimerStop(ms, surge)} />
      );
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
    default:
      throw new Error("Unknown combat phase " + props.combat.phase);
  }
}

export default Combat;


