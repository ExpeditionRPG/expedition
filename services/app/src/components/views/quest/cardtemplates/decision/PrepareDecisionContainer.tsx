import {connect} from 'react-redux';
import Redux from 'redux';
import {toDecisionCard} from './Actions';
import PrepareDecision, {DispatchProps} from './PrepareDecision';
import {DecisionPhase, mapStateToProps} from './Types';

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onStartTimer: (node: ParserNode) => {
      dispatch(handleDecisionTimerStart({node}));
    },
  };
};

const DecisionContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PrepareDecision);

export default DecisionContainer;
