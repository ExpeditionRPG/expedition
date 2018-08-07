import {toPrevious} from 'app/actions/Card';
import {event} from 'app/actions/Quest';
import {AppStateWithHistory} from 'app/reducers/StateTypes';
import {getStore} from 'app/Store';
import {connect} from 'react-redux';
import Redux from 'redux';
import {ParserNode} from '../TemplateTypes';
import {
  generateCombatTemplate,
} from './Actions';
import Defeat, {DispatchProps, StateProps} from './Defeat';
import {CombatState} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
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
    mostRecentRolls: stateCombat.mostRecentRolls,
    node: state.quest.node,
    settings: state.settings,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onCustomEnd: () => {
      dispatch(toPrevious({name: 'QUEST_CARD', phase: 'DRAW_ENEMIES', before: false}));
    },
    onEvent: (node: ParserNode, evt: string) => {
      dispatch(event({node, evt}));
    },
    onRetry: () => {
      dispatch(toPrevious({name: 'QUEST_CARD', phase: 'DRAW_ENEMIES', before: true}));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Defeat);
