import {getContentSets, numAdventurers, numAliveAdventurers, numPlayers} from 'app/actions/Settings';
import {CombatPhase} from 'app/Constants';
import {logEvent} from 'app/Logging';
import {AppStateWithHistory, SettingsType} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {ParserNode} from '../TemplateTypes';
import {
  adventurerDelta,
  handleCombatEnd,
  setupCombatDecision,
  tierSumDelta,
  toCombatPhase,
} from './Actions';
import PlayerTier, {DispatchProps, StateProps} from './PlayerTier';
import {mapStateToProps as mapStateToPropsBase} from './Types';

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
    const phase = state._history[histIdx].quest.node.ctx.templates.combat.phase;
    if (tier && phase === CombatPhase.prepare) {
      maxTier = Math.max(maxTier, tier);
    }
  }

  const node = ownProps.node;
  if (!node) {
    throw Error('Incomplete props given');
  }

  // Include the "live" state node for tier and adventurer count
  // Any combat param change (e.g. change in tier) causes a repaint
  return {
    ...mapStateToPropsBase(state, ownProps),
    node: state.quest.node,
    adventurers: numAdventurers(state.settings, state.multiplayer),
    combat: node.ctx.templates.combat,
    maxTier,
    numAliveAdventurers: numAliveAdventurers(state.settings, node, state.multiplayer),
    contentSets: getContentSets(state.settings, state.multiplayer),
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
      logEvent('combat', 'combat_defeat', {
        difficulty: settings.difficulty,
        label: numPlayers(settings),
        maxTier,
        players: numPlayers(settings),
        value: maxTier,
      });
      dispatch(handleCombatEnd({node, settings, victory: false, maxTier, seed}));
    },
    onNext: (node: ParserNode, phase: CombatPhase) => {
      dispatch(toCombatPhase({node, phase}));
    },
    onTierSumDelta: (node: ParserNode, current: number, delta: number) => {
      dispatch(tierSumDelta({node, current, delta}));
    },
    onVictory: (node: ParserNode, settings: SettingsType, maxTier: number, seed: string) => {
      logEvent('combat', 'combat_victory', {
        difficulty: settings.difficulty,
        label: numPlayers(settings),
        maxTier,
        players: numPlayers(settings),
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
