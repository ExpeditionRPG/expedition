import {connect} from 'react-redux';
import Redux from 'redux';
import {toDecisionCard} from './Actions';
import PrepareDecision, {DispatchProps} from './PrepareDecision';
import {mapStateToProps} from './Types';

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onStartTimer: () => {
      dispatch(toDecisionCard({name: 'QUEST_CARD', phase: 'DECISION_TIMER'}));
    },
  };
};

const DecisionContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PrepareDecision);

export default DecisionContainer;
