import {toCard, toPrevious} from 'app/actions/Card';
import {AppStateWithHistory} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {resolveCombat} from '../Params';
import Resolve, {DispatchProps, StateProps} from './Resolve';
import {CombatPhase} from './Types';
import {mapStateToProps as mapStateToPropsBase} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  return {
    ...mapStateToPropsBase(state, ownProps),
    mostRecentRolls: resolveCombat(state.quest.node).mostRecentRolls,
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
