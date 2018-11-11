import {toCard} from 'app/actions/Card';
import {toPrevious} from 'app/actions/Card';
import {connect} from 'react-redux';
import Redux from 'redux';
import {ParserNode} from '../TemplateTypes';
import {handleDecisionRoll} from './Actions';
import ResolveDecision, {DispatchProps} from './ResolveDecision';
import {mapStateToProps} from './Types';

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onReturn: () => {
      // Return to the Prepare Decision card instead of going back to the timer.
      dispatch(toPrevious({before: false, skip: [
        {name: 'QUEST_CARD', phase: 'DECISION_TIMER'},
        {name: 'QUEST_CARD', phase: 'MID_COMBAT_DECISION_TIMER'},
      ]}));
    },
    onRoll: (node: ParserNode, roll: number) => {
      dispatch(handleDecisionRoll({node, roll}));
    },
    onCombatDecisionEnd: () => {
      dispatch(toCard({name: 'QUEST_CARD', phase: 'PREPARE'}));
    },
  };
};

const ResolveDecisionContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ResolveDecision);

export default ResolveDecisionContainer;
