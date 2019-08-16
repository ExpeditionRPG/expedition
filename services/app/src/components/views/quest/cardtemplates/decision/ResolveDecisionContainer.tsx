import {toPrevious} from 'app/actions/Card';
import {CombatPhase} from 'app/Constants';
import {AppStateWithHistory, CardName} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {toCombatPhase} from '../combat/Actions';
import {ParserNode} from '../TemplateTypes';
import {handleDecisionRoll} from './Actions';
import ResolveDecision, {DispatchProps} from './ResolveDecision';
import {mapStateToProps as mapStateToPropsBase, StateProps} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  return mapStateToPropsBase(state, ownProps);
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onReturn: () => {
      // Return to the Prepare Decision card instead of going back to the timer.
      dispatch(toPrevious({before: false, matchFn: (c: CardName, n: ParserNode) => n.ctx.templates.combat.phase !== CombatPhase.midCombatDecisionTimer}));
    },
    onRoll: (node: ParserNode, roll: number) => {
      dispatch(handleDecisionRoll({node, roll}));
    },
    onCombatDecisionEnd: (node: ParserNode) => {
      dispatch(toCombatPhase({node, phase: CombatPhase.prepare}));
    },
  };
};

const ResolveDecisionContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ResolveDecision);

export default ResolveDecisionContainer;
