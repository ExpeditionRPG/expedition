import {toCard} from 'app/actions/Card';
import {connect} from 'react-redux';
import Redux from 'redux';
import {ParserNode} from '../TemplateTypes';
import {handleDecisionRoll} from './Actions';
import ResolveDecision, {DispatchProps} from './ResolveDecision';
import {mapStateToProps} from './Types';

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
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
