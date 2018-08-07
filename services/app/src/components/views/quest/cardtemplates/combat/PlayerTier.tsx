import AudioControlsContainer from 'app/components/base/AudioControlsContainer';
import Button from 'app/components/base/Button';
import Callout from 'app/components/base/Callout';
import Card from 'app/components/base/Card';
import Picker from 'app/components/base/Picker';
import TimerCard from 'app/components/base/TimerCard';
import {MAX_ADVENTURER_HEALTH, NODE_ENV} from 'app/Constants';
import {Enemy, EventParameters, Loot} from 'app/reducers/QuestTypes';
import {CardState, MultiplayerState, SettingsType} from 'app/reducers/StateTypes';
import * as React from 'react';
import {REGEX} from 'shared/Regex';
import Roleplay from '../roleplay/Roleplay';
import {ParserNode} from '../TemplateTypes';
import {isSurgeNextRound, roundTimeMillis} from './Actions';
import {CombatPhase, CombatState} from './Types';

export interface StateProps {
  combat: CombatState;
  maxTier: number;
  node: ParserNode;
  numAliveAdventurers: number;
  seed: string;
  settings: SettingsType;
  tier: number;
}

export interface DispatchProps {
  onAdventurerDelta: (node: ParserNode, settings: SettingsType, current: number, delta: number) => void;
  onChoice: (node: ParserNode, settings: SettingsType, index: number, maxTier: number, seed: string) => void;
  onDecisionSetup: (node: ParserNode, seed: string) => void;
  onDefeat: (node: ParserNode, settings: SettingsType, maxTier: number, seed: string) => void;
  onNext: (phase: CombatPhase) => void;
  onTierSumDelta: (node: ParserNode, current: number, delta: number) => void;
  onVictory: (node: ParserNode, settings: SettingsType, maxTier: number, seed: string) => void;
}

export interface Props extends StateProps, DispatchProps {}

export default playerTier(props: Props); : JSX.Element; {
  const nextCard: CombatPhase = (props.settings.timerSeconds) ? 'PREPARE' : 'NO_TIMER';

  let shouldRunDecision = false;
  if (props.settings.experimental) {
    shouldRunDecision = (NODE_ENV === 'dev') && (props.combat.roundCount % 5 === 0 || props.combat.roundCount % 5 === 3);
  }

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
      <Button onClick={() => (shouldRunDecision) ? props.onDecisionSetup(props.node, props.seed) : props.onNext(nextCard)} disabled={props.numAliveAdventurers <= 0}>Next</Button>
      <Button onClick={() => props.onVictory(props.node, props.settings, props.maxTier, props.seed)}>Victory (Tier = 0)</Button>
      <Button onClick={() => props.onDefeat(props.node, props.settings, props.maxTier, props.seed)}>Defeat (Adventurers = 0)</Button>
    </Card>
  );
}
