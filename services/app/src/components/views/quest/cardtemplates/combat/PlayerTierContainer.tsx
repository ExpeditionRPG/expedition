import {toCard} from 'app/actions/Card';
import {logEvent} from 'app/Logging';
import {AppStateWithHistory, SettingsType} from 'app/reducers/StateTypes';
import {getStore} from 'app/Store';
import {connect} from 'react-redux';
import Redux from 'redux';
import {ParserNode} from '../TemplateTypes';
import {
  adventurerDelta,
  generateCombatTemplate,
  handleCombatEnd,
  setupCombatDecision,
  tierSumDelta,
} from './Actions';
import PlayerTier, {DispatchProps, StateProps} from './PlayerTier';
import {CombatPhase, CombatState} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  let maxTier = 0;
  let histIdx: number = state._history.length - 1;
  // card.phase currently represents combat boundaries - non-combat cards don't use phases
  while (Boolean(state._history[histIdx]) && state._history[histIdx].quest && state._history[histIdx].quest.node && state._history[histIdx].quest.node.ctx.templates.combat && histIdx > 0) {
    const combatContext = state._history[histIdx].quest.node.ctx.templates.combat;
    if (!combatContext) {
      break;
    }
    const tier = combatContext.tier;
    histIdx--;
    const phase = state._history[histIdx].card.phase;
    if (tier && phase !== null && ['PREPARE', 'NO_TIMER'].indexOf(phase) !== -1) {
      maxTier = Math.max(maxTier, tier);
    }
  }

  const node = ownProps.node;
  if (!node) {
    throw Error('Incomplete props given');
  }

  const combatFromNode = (node && node.ctx && node.ctx.templates && node.ctx.templates.combat);
  const combat: CombatState = combatFromNode || generateCombatTemplate(state.settings, false, state.quest.node, getStore().getState);

  const stateCombat = (state.quest.node && state.quest.node.ctx && state.quest.node.ctx.templates && state.quest.node.ctx.templates.combat)
    || {tier: 0, mostRecentRolls: [10], numAliveAdventurers: 1};

  // Override with dynamic state for tier and adventurer count
  // Any combat param change (e.g. change in tier) causes a repaint
  return {
    combat,
    maxTier,
    node: state.quest.node,
    numAliveAdventurers: stateCombat.numAliveAdventurers,
    seed: state.quest.seed,
    settings: state.settings,
    tier: stateCombat.tier,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onAdventurerDelta: (node: ParserNode, settings: SettingsType, current: number, delta: number) => {
      dispatch(adventurerDelta({node, settings, current, delta}));
    },
    onDecisionSetup: (node: ParserNode, seed: string) => {
      dispatch(setupCombatDecision({node, seed}));
    },
    onDefeat: (node: ParserNode, settings: SettingsType, maxTier: number, seed: string) => {
      logEvent('combat_defeat', {
        difficulty: settings.difficulty,
        label: settings.numPlayers,
        maxTier,
        players: settings.numPlayers,
        value: maxTier,
      });
      dispatch(handleCombatEnd({node, settings, victory: false, maxTier, seed}));
    },
    onNext: (phase: CombatPhase) => {
      dispatch(toCard({name: 'QUEST_CARD', phase}));
    },
    onTierSumDelta: (node: ParserNode, current: number, delta: number) => {
      dispatch(tierSumDelta({node, current, delta}));
    },
    onVictory: (node: ParserNode, settings: SettingsType, maxTier: number, seed: string) => {
      logEvent('combat_victory', {
        difficulty: settings.difficulty,
        label: settings.numPlayers,
        maxTier,
        players: settings.numPlayers,
        value: maxTier,
      });
      dispatch(handleCombatEnd({node, settings, victory: true, maxTier, seed}));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PlayerTier);
