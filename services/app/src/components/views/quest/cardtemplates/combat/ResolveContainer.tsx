import {toCard, toPrevious} from 'app/actions/Card';
import {AppStateWithHistory} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import Resolve, {DispatchProps, StateProps} from './Resolve';
import {CombatPhase} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  const node = ownProps.node;
  if (!node) {
    throw Error('Incomplete props given');
  }

  const stateCombat = (state.quest.node && state.quest.node.ctx && state.quest.node.ctx.templates && state.quest.node.ctx.templates.combat)
    || {tier: 0, mostRecentRolls: [10], numAliveAdventurers: 1};

  // Override with dynamic state for tier and adventurer count
  // Any combat param change (e.g. change in tier) causes a repaint
  return {
    node: ownProps.node || state.quest.node,
    mostRecentRolls: stateCombat.mostRecentRolls,
    settings: state.settings,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onNext: (phase: CombatPhase) => {
      dispatch(toCard({name: 'QUEST_CARD', phase}));
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
)(Resolve);
