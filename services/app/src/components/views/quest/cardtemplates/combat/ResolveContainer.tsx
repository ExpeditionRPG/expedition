import {toCard, toPrevious} from 'app/actions/Card';
import {getContentSets} from 'app/actions/Settings';
import {CombatPhase} from 'app/Constants';
import {AppStateWithHistory} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import Resolve, {DispatchProps, StateProps} from './Resolve';
import {mapStateToProps as mapStateToPropsBase} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  return {
    ...mapStateToPropsBase(state, ownProps),
    mostRecentRolls: state.quest.node.ctx.templates.combat.mostRecentRolls,
    contentSets: getContentSets(state.settings, state.multiplayer),
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onNext: (phase: CombatPhase) => {
      dispatch(toCard({name: 'QUEST_CARD', phase}));
    },
    onReturn: () => {
      // Return to the "Ready for Combat?" card instead of doing the timed round again.
      dispatch(toPrevious({before: false, skip: [{name: 'QUEST_CARD', phase: CombatPhase.timer}]}));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Resolve);
