import {toPrevious} from 'app/actions/Card';
import {AppStateWithHistory, SettingsType} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {
  midCombatChoice,
} from '../roleplay/Actions';
import {ParserNode} from '../TemplateTypes';
import MidCombatRoleplay, {DispatchProps, StateProps} from './MidCombatRoleplay';

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

  // Override with dynamic state for tier and adventurer count
  // Any combat param change (e.g. change in tier) causes a repaint
  return {
    maxTier,
    node: state.quest.node,
    seed: state.quest.seed,
    settings: state.settings,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onChoice: (node: ParserNode, settings: SettingsType, index: number, maxTier: number, seed: string) => {
      dispatch(midCombatChoice({node, settings, index, maxTier, seed}));
    },
    onRetry: () => {
      dispatch(toPrevious({name: 'QUEST_CARD', phase: 'DRAW_ENEMIES', before: true}));
    },
    onReturn: () => {
      // Return to the "Ready for Combat?" card instead of doing the timed round again.
      dispatch(toPrevious({before: false, skip: [{name: 'QUEST_CARD', phase: 'TIMER'}]}));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MidCombatRoleplay);
