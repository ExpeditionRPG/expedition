import {connect} from 'react-redux';
import Redux from 'redux';
import {toCard, toPrevious} from 'app/actions/Card';
import {logEvent} from 'app/Logging';
import MidCombatDecision, {DispatchProps, StateProps} from './MidCombatDecision';
import {handleDecisionSelect} from '../../decision/Actions';
import {EMPTY_DECISION_STATE, LeveledSkillCheck} from '../../decision/Types';
import {
  handleCombatDecisionRoll,
  setupCombatDecision,
  toDecisionCard,
} from './Actions';

const mapStateToProps = (state: AppState, ownProps: any): StateProps => {
  const decision = (ownProps.node && ownProps.node.ctx && ownProps.node.ctx.templates && ownProps.node.ctx.templates.decision)
  || EMPTY_DECISION_STATE;

  return {
    card: ownProps.card,
    decision,
    multiplayerState: state.multiplayer,
    node: state.quest.node,
    seed: state.quest.seed,
    settings: state.settings,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): DispatchProps => {
  return {
    onDecisionSetup: (node: ParserNode, seed: string) => {
      dispatch(setupCombatDecision({node, seed}));
    },
    onDecisionSelect: (node: ParserNode, selected: LeveledSkillCheck, elapsedMillis: number) => {
      dispatch(handleDecisionSelect({node, elapsedMillis, selected}));
      dispatch(toDecisionCard({phase: 'RESOLVE_DECISION'}));
    },
    onDecisionEnd: () => {
      dispatch(toCard({name: 'QUEST_CARD', phase: 'PREPARE'}));
    },
    onDecisionRoll: (node: ParserNode, roll: number) => {
      dispatch(handleCombatDecisionRoll({node, roll}));
    },
    onDecisionTimerStart: () => {
      dispatch(toDecisionCard({phase: 'DECISION_TIMER'}));
    },
  };
};

const CheckoutContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Checkout);

export default CheckoutContainer;
