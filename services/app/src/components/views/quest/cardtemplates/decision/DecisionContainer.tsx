import {connect} from 'react-redux';
import Redux from 'redux';
import {toCard} from 'app/actions/Card';
import {AppStateWithHistory} from 'app/reducers/StateTypes';
import {LeveledSkillCheck, EMPTY_DECISION_STATE} from '../decision/Types';
import {ParserNode} from '../TemplateTypes';
import {
  handleDecisionRoll,
  handleDecisionSelect,
} from './Actions';
import {DecisionState} from './Types';
import Decision, {DispatchProps, StateProps} from './Decision';

const mapStateToProps = (state: AppStateWithHistory, ownProps: StateProps): StateProps => {
  const decision = (ownProps.node && ownProps.node.ctx && ownProps.node.ctx.templates && ownProps.node.ctx.templates.decision) || EMPTY_DECISION_STATE;

  return {
    card: ownProps.card,
    decision,
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
      dispatch(toCard({name: 'QUEST_CARD', phase: 'RESOLVE_DECISION', noHistory: true}));
    },
    onEnd: () => {
      // TODO
    },
    onRoll: (node: ParserNode, roll: number) => {
      dispatch(handleDecisionRoll({node, roll}));
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
