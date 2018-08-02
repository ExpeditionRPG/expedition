import {toCard} from 'app/actions/Card';
import {AppState} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {handleDecisionSelect} from '../../decision/Actions';
import {EMPTY_DECISION_STATE, LeveledSkillCheck} from '../../decision/Types';
import {ParserNode} from '../../TemplateTypes';
import {
  handleCombatDecisionRoll,
  toDecisionCard,
} from './Actions';
import MidCombatDecision, {DispatchProps, StateProps} from './MidCombatDecision';

const mapStateToProps = (state: AppState, ownProps: Partial<StateProps>): StateProps => {
  const decision = (ownProps.node && ownProps.node.ctx && ownProps.node.ctx.templates && ownProps.node.ctx.templates.decision)
  || EMPTY_DECISION_STATE;

  const phase = (ownProps.node && ownProps.node.ctx && ownProps.node.ctx.templates && ownProps.node.ctx.templates.combat && ownProps.node.ctx.templates.combat.decisionPhase) || 'PREPARE_DECISION';

  return {
    decision,
    phase,
    multiplayerState: state.multiplayer,
    node: state.quest.node,
    seed: state.quest.seed,
    settings: state.settings,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onSelect: (node: ParserNode, selected: LeveledSkillCheck, elapsedMillis: number) => {
      dispatch(handleDecisionSelect({node, elapsedMillis, selected}));
      dispatch(toDecisionCard({phase: 'RESOLVE_DECISION'}));
    },
    onEnd: () => {
      dispatch(toCard({name: 'QUEST_CARD', phase: 'PREPARE'}));
    },
    onRoll: (node: ParserNode, roll: number) => {
      dispatch(handleCombatDecisionRoll({node, roll}));
    },
    onTimerStart: () => {
      dispatch(toDecisionCard({phase: 'DECISION_TIMER'}));
    },
  };
};

const MidCombatDecisionContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MidCombatDecision);

export default MidCombatDecisionContainer;
