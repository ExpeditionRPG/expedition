import {toCard} from 'app/actions/Card';
import {AppStateWithHistory} from 'app/reducers/StateTypes';
import {getStore} from 'app/Store';
import {connect} from 'react-redux';
import Redux from 'redux';
import {ParserNode} from '../TemplateTypes';
import {
  generateCombatTemplate,
  tierSumDelta,
} from './Actions';
import DrawEnemies, {DispatchProps, StateProps} from './DrawEnemies';
import {CombatPhase, CombatState} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  const node = ownProps.node;
  if (!node) {
    throw Error('Incomplete props given');
  }
  const combatFromNode = (node && node.ctx && node.ctx.templates && node.ctx.templates.combat);
  const combat: CombatState = combatFromNode || generateCombatTemplate(state.settings, false, state.quest.node, getStore().getState);
  const stateCombat = (state.quest.node && state.quest.node.ctx && state.quest.node.ctx.templates && state.quest.node.ctx.templates.combat)
    || {tier: 0, mostRecentRolls: [10], numAliveAdventurers: 1};

  // Override with dynamic state for tier
  // Any change causes a repaint
  return {
    node: ownProps.node || state.quest.node,
    combat,
    settings: state.settings,
    tier: stateCombat.tier,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onNext: (phase: CombatPhase) => {
      dispatch(toCard({name: 'QUEST_CARD', phase}));
    },
    onTierSumDelta: (node: ParserNode, current: number, delta: number) => {
      dispatch(tierSumDelta({node, current, delta}));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DrawEnemies);
