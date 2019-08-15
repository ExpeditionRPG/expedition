import {DecisionPhase} from 'app/Constants';
import {AppStateWithHistory} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {toDecisionCard} from './Actions';
import PrepareDecision, {DispatchProps} from './PrepareDecision';
import {mapStateToProps as mapStateToPropsBase, StateProps} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  return mapStateToPropsBase(state, ownProps);
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onStartTimer: () => {
      dispatch(toDecisionCard({name: 'QUEST_CARD', phase: DecisionPhase.timer}));
    },
  };
};

const DecisionContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PrepareDecision);

export default DecisionContainer;
