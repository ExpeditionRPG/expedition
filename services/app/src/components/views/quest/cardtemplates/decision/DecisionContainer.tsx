import {connect} from 'react-redux';
import Redux from 'redux';
import {toCard} from '../../../../../actions/Card';
import {AppStateWithHistory, SettingsType} from '../../../../../reducers/StateTypes';
import {EMPTY_DECISION_STATE, LeveledSkillCheck} from '../decision/Types';
import {ParserNode} from '../TemplateTypes';
import {
  handleDecisionRoll,
  handleDecisionSelect,
} from './Actions';
import Decision, {DecisionDispatchProps, DecisionStateProps} from './Decision';
import {DecisionState} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: DecisionStateProps): DecisionStateProps => {
  // const stateDecision = (state.quest.node && state.quest.node.ctx && state.quest.node.ctx.templates && state.quest.node.ctx.templates.decision) || EMPTY_DECISION_STATE;
  const decision = (ownProps.node && ownProps.node.ctx && ownProps.node.ctx.templates && ownProps.node.ctx.templates.decision) || EMPTY_DECISION_STATE;

  return {
    card: state.card,
    decision,
    multiplayerState: state.multiplayer,
    node: state.quest.node,
    seed: state.quest.seed,
    settings: state.settings,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): DecisionDispatchProps => {
  return {
    onSelect: (node: ParserNode, selected: LeveledSkillCheck, elapsedMillis: number) => {
      dispatch(handleDecisionSelect({node, elapsedMillis, selected}));
      dispatch(toCard({name: 'QUEST_CARD', phase: 'RESOLVE_DECISION', noHistory: true}));
    },
    onEnd: () => {
      // TODO
    },
    onRoll: (node: ParserNode, roll: number) => {
      dispatch(handleDecisionRoll({node, roll}));
      dispatch(toCard({name: 'QUEST_CARD', phase: 'RESOLVE_DECISION', noHistory: true, keySuffix: Date.now().toString()}));
    },
    onStartTimer: () => {
      dispatch(toCard({name: 'QUEST_CARD', phase: 'DECISION_TIMER'}));
    },
  };
};

const DecisionContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Decision);

export default DecisionContainer;
