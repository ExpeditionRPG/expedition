import {toCard} from 'app/actions/Card';
import {toPrevious} from 'app/actions/Card';
import {connect} from 'react-redux';
import Redux from 'redux';
import {CombatPhase} from '../combat/Types';
import {ParserNode} from '../TemplateTypes';
import {handleDecisionRoll} from './Actions';
import ResolveDecision, {DispatchProps} from './ResolveDecision';
import {DecisionPhase, mapStateToProps} from './Types';

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onReturn: () => {
      // Return to the Prepare Decision card instead of going back to the timer.
      dispatch(toPrevious({before: false, skip: [
        {name: 'QUEST_CARD', phase: DecisionPhase.timer},
        {name: 'QUEST_CARD', phase: CombatPhase.midCombatDecisionTimer},
      ]}));
    },
    onRoll: (node: ParserNode, roll: number) => {
      dispatch(handleDecisionRoll({node, roll}));
    },
    onCombatDecisionEnd: () => {
      dispatch(toCard({name: 'QUEST_CARD', phase: CombatPhase.prepare}));
    },
  };
};

const ResolveDecisionContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ResolveDecision);

export default ResolveDecisionContainer;
