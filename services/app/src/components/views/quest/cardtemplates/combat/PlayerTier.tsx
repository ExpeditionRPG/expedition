import Button from 'app/components/base/Button';
import Callout from 'app/components/base/Callout';
import Card from 'app/components/base/Card';
import Picker from 'app/components/base/Picker';
import {CombatPhase} from 'app/Constants';
import {ContentSetsType, SettingsType} from 'app/reducers/StateTypes';
import * as React from 'react';
import {CONTENT_SET_FULL_NAMES, Expansion} from 'shared/schema/Constants';
import {ParserNode} from '../TemplateTypes';
import {CombatState} from './Types';
import {StateProps as StatePropsBase} from './Types';

export interface StateProps extends StatePropsBase {
  adventurers: number;
  combat: CombatState;
  maxTier: number;
  numAliveAdventurers: number;
  localAliveAdventurers: number;
  seed: string;
  tier: number;
  contentSets: Set<keyof ContentSetsType>;
}

export interface DispatchProps {
  onAdventurerDelta: (node: ParserNode, settings: SettingsType, current: number, delta: number) => void;
  onDecisionSetup: (node: ParserNode, seed: string) => void;
  onDefeat: (node: ParserNode, settings: SettingsType, maxTier: number, seed: string) => void;
  onNext: (phase: CombatPhase) => void;
  onTierSumDelta: (node: ParserNode, current: number, delta: number) => void;
  onVictory: (node: ParserNode, settings: SettingsType, maxTier: number, seed: string) => void;
}

export interface Props extends StateProps, DispatchProps {}

export default function playerTier(props: Props): JSX.Element {
  let shouldRunDecision = false;
  if (props.contentSets.has(Expansion.future)) {
    shouldRunDecision = (props.combat.roundCount % 5 === 0 || props.combat.roundCount % 5 === 3);
  }

  let helpText: JSX.Element = (<span></span>);
  const damage = (props.combat.mostRecentAttack) ? props.combat.mostRecentAttack.damage : -1;
  const theHorror = (props.contentSets.has(Expansion.horror) === true);
  const injured = props.localAliveAdventurers < props.adventurers;

  if (props.settings.showHelp) {
    helpText = (
      <span>
        {injured && <p>
          If you reach zero health, you are knocked out.
          After resolving this turn, you cannot play further cards until you are healed by another adventurer or revived at the end of the encounter.
        </p>}
        {theHorror && injured && <Callout icon="horror_white"><strong>{CONTENT_SET_FULL_NAMES.horror}:</strong> Upon being knocked out, reset your persona to Base.</Callout>}
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
        onDelta={(i: number) => props.onAdventurerDelta(props.node, props.settings, props.localAliveAdventurers, i)}
        value={props.localAliveAdventurers}>
        {props.settings.showHelp && (props.numAliveAdventurers === props.localAliveAdventurers)
          ? <span>The number of adventurers &gt; 0 health.</span>
          : <span>Local adventurers &gt; 0 health.<br/>({props.numAliveAdventurers} across all devices)</span>
        }
      </Picker>
      {helpText}
      <Button
        className={(props.numAliveAdventurers === 0 || props.tier === 0) ? 'subtle' : ''}
        disabled={props.numAliveAdventurers <= 0 || props.tier <= 0}
        onClick={() => (shouldRunDecision) ? props.onDecisionSetup(props.node, props.seed) : props.onNext(CombatPhase.prepare)}>Next</Button>
      <Button
        className={(props.tier !== 0) ? 'subtle' : ''}
        disabled={props.numAliveAdventurers <= 0 && props.tier > 0}
        onClick={() => props.onVictory(props.node, props.settings, props.maxTier, props.seed)}>Victory (Tier = 0)</Button>
      <Button
        className={(props.numAliveAdventurers !== 0) ? 'subtle' : ''}
        disabled={props.tier <= 0}
        onClick={() => props.onDefeat(props.node, props.settings, props.maxTier, props.seed)}>Defeat (Adventurers = 0)</Button>
    </Card>
  );
}
