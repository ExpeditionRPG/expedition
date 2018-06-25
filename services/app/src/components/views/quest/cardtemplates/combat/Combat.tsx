import * as React from 'react';
import {REGEX} from 'shared/Regex';
import {MAX_ADVENTURER_HEALTH, NODE_ENV} from '../../../../../Constants';
import {Enemy, EventParameters, Loot} from '../../../../../reducers/QuestTypes';
import {CardState, MultiplayerState, SettingsType} from '../../../../../reducers/StateTypes';
import AudioControlsContainer from '../../../../base/AudioControlsContainer';
import Button from '../../../../base/Button';
import Callout from '../../../../base/Callout';
import Card from '../../../../base/Card';
import Picker from '../../../../base/Picker';
import TimerCard from '../../../../base/TimerCard';
import Decision from '../decision/Decision';
import {DecisionState, DecisionType} from '../decision/Types';
import Roleplay from '../roleplay/Roleplay';
import {ParserNode} from '../TemplateTypes';
import {isSurgeNextRound, roundTimeMillis} from './Actions';
import {CombatPhase, CombatState} from './Types';

export interface CombatStateProps {
  card: CardState;
  combat: CombatState;
  settings: SettingsType;
  decision: DecisionState;
  maxTier: number;
  node: ParserNode;
  seed: string;
  victoryParameters?: EventParameters;
  multiplayerState?: MultiplayerState;
  tier: number;
  numAliveAdventurers: number;
  mostRecentRolls?: number[];
}

export interface CombatDispatchProps {
  onNext: (phase: CombatPhase) => void;
  onDefeat: (node: ParserNode, settings: SettingsType, maxTier: number, seed: string) => void;
  onRetry: () => void;
  onVictory: (node: ParserNode, settings: SettingsType, maxTier: number, seed: string) => void;
  onTimerStart: () => void;
  onTimerHeld: (node: ParserNode) => void;
  onTimerStop: (node: ParserNode, settings: SettingsType, elapsedMillis: number, surge: boolean, seed: string) => void;
  onReturn: () => void;
  onTierSumDelta: (node: ParserNode, current: number, delta: number) => void;
  onAdventurerDelta: (node: ParserNode, settings: SettingsType, current: number, delta: number) => void;
  onEvent: (node: ParserNode, event: string) => void;
  onCustomEnd: () => void;
  onChoice: (node: ParserNode, settings: SettingsType, index: number, maxTier: number, seed: string) => void;
  onSurgeNext: (node: ParserNode) => void;

  onDecisionSetup: () => void;
  onDecisionTimerStart: () => void;
  onDecisionChoice: (node: ParserNode, settings: SettingsType, choice: DecisionType, elapsedMillis: number, seed: string) => void;
  onDecisionRoll: (node: ParserNode, settings: SettingsType, decision: DecisionState, roll: number, seed: string) => void;
  onDecisionEnd: () => void;
}

export interface CombatProps extends CombatStateProps, CombatDispatchProps {}

const numerals: {[k: number]: string; } = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
};

function renderSelectTier(props: CombatProps): JSX.Element {
  const nextCard = (props.settings.timerSeconds) ? 'PREPARE' : 'NO_TIMER';
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

function renderDrawEnemies(props: CombatProps): JSX.Element {
  const nextCard = (props.settings.timerSeconds) ? 'PREPARE' : 'NO_TIMER';
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
        {enemy.name} <span className="meta">(Tier {numerals[enemy.tier]} {icon})</span>
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

function renderNoTimer(props: CombatProps): JSX.Element {
  // Note: similar help text in renderPrepareTimer()
  const surge = isSurgeNextRound(props.node.ctx.templates.combat);
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

function renderPrepareTimer(props: CombatProps): JSX.Element {
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

function renderSurge(props: CombatProps): JSX.Element {
  let helpText: JSX.Element = (<span></span>);
  if (props.settings.showHelp) {
    helpText = (
      <span>
        <p>
          Immediately follow the surge action listed on all remaining encounter cards. Some Undead surges apply after they've been knocked out.
        </p>
        <p>
          Surge effects happen before abilities. Abilities that apply "this round" do not affect surges (however, loot may still be used during a surge). If you are knocked out during a surge, do not resolve your abilities.
        </p>
      </span>
    );
  }
  return (
    <Card title="Enemy Surge!"
      theme="red"
      inQuest={true}
      onReturn={() => props.onReturn()}
    >
      <h3>An enemy surge occurs!</h3>
      {helpText}
      <Button onClick={() => props.onSurgeNext(props.node)}>Next</Button>
    </Card>
  );
}

function renderResolve(props: CombatProps): JSX.Element {
  let helpText: JSX.Element = (<p>Resolve all played abilities.</p>);
  const theHorror = (props.settings.contentSets.horror === true);
  if (props.settings.showHelp) {
    helpText = (
      <span>
        {theHorror && <div>
          <h2>The Horror <img className="inline_icon" src="images/horror_white_small.svg"></img></h2>
          <p>Adventurers at Min persona must resolve their persona effect and reset to Base persona before resolving abilities. Adventurers at Max persona may choose to resolve and reset now or in a later round.</p>
        </div>}
        <h2>Roll <img className="inline_icon" src="images/roll_white_small.svg"></img></h2>
        <p>
          Each adventurer rolls a die for each ability they played. If <img className="inline_icon" src="images/roll_white_small.svg"></img> &ge; X, the ability succeeds. Ability cards may list additional effects based on the roll, even if they fail.
        </p>
        <h2>Resolve & Discard <img className="inline_icon" src="images/cards_white_small.svg"></img></h2>
        <p>
          <strong>Resolve</strong> your abilities in any order. You may change the resolution order during the round, even after some abilities have been played.
        </p>
        <p>
          <strong>Discard</strong> all ability(s) you resolved this round. Put unplayed abilities back into your draw pile before shuffling.
        </p>
        <h2>Modifiers <img className="inline_icon" src="images/damage_white_small.svg"></img></h2>
        <p>
          Enemies may have modifiers on their cards that affect the damage they receive. The modifier applies to the final damage value of each card played against them.
        </p>

      </span>
    );
  }
  let renderedRolls: JSX.Element[]|null = null;
  if (props.settings.autoRoll && props.mostRecentRolls) {
    renderedRolls = props.mostRecentRolls.map((roll: number, index: number) => {
      return (<div className="roll" key={index}>{roll}</div>);
    });
  }

  return (
    <Card title="Roll &amp; Resolve" theme="dark" inQuest={true} onReturn={() => props.onReturn()}>
      {helpText}
      {renderedRolls &&
        <div>
          {props.settings.showHelp && <p>Resolve your abilities with the following rolls. Start with the last person to read the quest and go clockwise:</p>}
          <div className="rolls">{renderedRolls}</div>
        </div>
      }
      <Button onClick={() => props.onNext('RESOLVE_DAMAGE')}>Next</Button>
    </Card>
  );
}

function renderPlayerTier(props: CombatProps): JSX.Element {
  const nextCard: CombatPhase = (props.settings.timerSeconds) ? 'PREPARE' : 'NO_TIMER';

  const shouldRunDecision = (NODE_ENV === 'dev') && (props.combat.roundCount % 2 === 0); // TODO CHANGE

  let helpText: JSX.Element = (<span></span>);
  const damage = (props.combat.mostRecentAttack) ? props.combat.mostRecentAttack.damage : -1;
  const theHorror = (props.settings.contentSets.horror === true);
  const injured = props.numAliveAdventurers < props.settings.numPlayers;

  if (props.settings.showHelp) {
    helpText = (
      <span>
        {injured && <p>
          If you reach zero health, you are knocked out.
          After resolving this turn, you cannot play further cards until you are healed by another adventurer or revived at the end of the encounter.
        </p>}
        {theHorror && injured && <Callout icon="horror_white"><strong>The Horror:</strong> Upon being knocked out, reset your persona to Base.</Callout>}
      </span>
    );
  }

  return (
    <Card title="Resolve Damage" theme="dark" inQuest={true}>
      <h4 className="combat center damage-label">All adventurers take:</h4>
      <h1 className="combat center damage">{damage} Damage</h1>
      <Picker
        label="Tier Sum"
        id="tier_sum"
        onDelta={(i: number) => props.onTierSumDelta(props.node, props.tier, i)}
        value={props.tier}>
        {props.settings.showHelp && 'The total tier of remaining enemies.'}
      </Picker>

      <Picker
        label="Adventurers"
        id="adventurers"
        onDelta={(i: number) => props.onAdventurerDelta(props.node, props.settings, props.numAliveAdventurers, i)}
        value={props.numAliveAdventurers}>
        {props.settings.showHelp && <span>The number of adventurers &gt; 0 health.</span>}
      </Picker>
      {helpText}
      <Button onClick={() => (shouldRunDecision) ? props.onDecisionSetup() : props.onNext(nextCard)} disabled={props.numAliveAdventurers <= 0}>Next</Button>
      <Button onClick={() => props.onVictory(props.node, props.settings, props.maxTier, props.seed)}>Victory (Tier = 0)</Button>
      <Button onClick={() => props.onDefeat(props.node, props.settings, props.maxTier, props.seed)}>Defeat (Adventurers = 0)</Button>
    </Card>
  );
}

function renderVictory(props: CombatProps): JSX.Element {
  const contents: JSX.Element[] = [];
  const theHorror = (props.settings.contentSets.horror === true);

  if (props.victoryParameters) {
    if (props.victoryParameters.heal && props.victoryParameters.heal > 0 && props.victoryParameters.heal < MAX_ADVENTURER_HEALTH) {
      contents.push(<p key="c1">All adventurers <strong>regain {props.victoryParameters.heal} health</strong> (even if at 0 health).</p>);
    } else if (props.victoryParameters.heal === 0) {
      contents.push(<p key="c1">Adventurers <strong>do not heal</strong>.</p>);
    } else {
      contents.push(<p key="c1">All adventurers heal to full health (even if at 0 health).</p>);
    }

    if (theHorror) {
      // Mimic <instruction> appearance
      contents.push(<div key="c1_horror" className="callout"><p><img className="inline_icon" src={`images/horror_white_small.svg`} /></p><div className="text"><p>The Horror: Keep your current Persona level.</p></div></div>);
    }

    if (props.victoryParameters.loot !== false && props.combat.loot && props.combat.loot.length > 0) {
      contents.push(
        <p key="c4">The party draws the following loot:</p>
      );
      const renderedLoot = props.combat.loot.map((loot: Loot, index: number) => {
        return (<li key={index}><strong>{capitalizeFirstLetter(numberToWord(loot.count))} tier {numerals[loot.tier]} loot</strong></li>);
      });
      contents.push(<ul key="c5">{renderedLoot}</ul>);

      if (props.settings.showHelp) {
        contents.push(
          <span key="c6">
            <p>Divide the loot amongst adventurers. It can be used at any time and does not cost an action (unless otherwise specified).</p>
          </span>
        );
      }
    }

    if (props.victoryParameters.xp !== false && props.combat.levelUp) {
      contents.push(<span key="c2"><h3>LEVEL UP!</h3><p>All adventurers may learn a new ability:</p></span>);
      if (props.settings.showHelp) {
        contents.push(
          <ul key="c3">
            <li>Draw 3 abilities from one of the decks listed on your adventurer card.</li>
            {theHorror && <ul>
              <li><strong>The Horror:</strong> All adventurers may also draw from the Influence deck.</li>
            </ul>}
            <li>Add 1 to your ability deck, and place the remaining 2 at the bottom of the deck you drew from.</li>
            <li>You <i>may</i> choose to discard an ability.</li>
          </ul>
        );
      }
    }
  }

  return (
    <Card title="Victory" theme="dark" inQuest={true}>
      {props.settings.showHelp && <p>Shuffle all of your ability cards back into your ability draw pile.</p>}
      {contents}
      <Button onClick={() => (props.combat.custom) ? props.onCustomEnd() : props.onEvent(props.node, 'win')}>Next</Button>
    </Card>
  );
}

function renderDefeat(props: CombatProps): JSX.Element {
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
  if (!props.combat.custom) {
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

function renderTimerCard(props: CombatProps): JSX.Element {
  const surge = isSurgeNextRound(props.node.ctx.templates.combat);
  const surgeWarning = (props.settings.difficulty === 'EASY' && surge) ? 'Surge Imminent' : undefined;
  let instruction: string|undefined;
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

  const enemies = props.combat.enemies;
  const enemy = enemies[Math.floor(Math.random() * enemies.length)];
  const enemyClass = ((enemy || {}).class || '').toLowerCase();

  return (
    <TimerCard
      theme="dark"
      secondaryText={surgeWarning}
      tertiaryText={instruction}
      icon={enemyClass}
      numPlayers={(props.settings.multitouch && props.settings.numPlayers > 1) ? props.numAliveAdventurers : 1}
      roundTimeTotalMillis={roundTimeMillis(props.settings, props.multiplayerState)}
      multiplayerState={props.multiplayerState}
      onTimerStop={(ms: number) => props.onTimerStop(props.node, props.settings, ms, surge, props.seed)} />
  );
}

function renderMidCombatRoleplay(props: CombatProps): JSX.Element {
  return Roleplay({
    node: props.node,
    settings: props.settings,
    onChoice: (settings: SettingsType, node: ParserNode, index: number) => {props.onChoice(props.node, settings, index, props.maxTier, props.seed); },
    onRetry: () => {props.onRetry(); },
    onReturn: () => {props.onReturn(); },
  }, 'dark');
}

function renderMidCombatDecision(props: CombatProps): JSX.Element {
  const decision = props.decision;

  return Decision({
    card: {...props.card, phase: props.combat.decisionPhase},
    decision,
    settings: props.settings,
    node: props.node,
    seed: props.seed,
    maxAllowedAttempts: props.combat.numAliveAdventurers,
    multiplayerState: props.multiplayerState,
    onStartTimer: props.onDecisionTimerStart,
    onChoice: props.onDecisionChoice,
    onRoll: props.onDecisionRoll,
    onEnd: props.onDecisionEnd,
  }, 'dark');
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
  switch (props.card.phase) {
    case 'DRAW_ENEMIES':
      return (props.combat.custom) ? renderSelectTier(props) : renderDrawEnemies(props);
    case 'NO_TIMER':
      return renderNoTimer(props);
    case 'PREPARE':
      return renderPrepareTimer(props);
    case 'TIMER':
      return renderTimerCard(props);
    case 'SURGE':
      return renderSurge(props);
    case 'RESOLVE_ABILITIES':
      return renderResolve(props);
    case 'RESOLVE_DAMAGE':
      return renderPlayerTier(props);
    case 'VICTORY':
      return renderVictory(props);
    case 'DEFEAT':
      return renderDefeat(props);
    case 'MID_COMBAT_ROLEPLAY':
      return renderMidCombatRoleplay(props);
    case 'MID_COMBAT_DECISION':
      return renderMidCombatDecision(props);
    default:
      throw new Error('Unknown combat phase ' + props.card.phase);
  }
};

export default Combat;
