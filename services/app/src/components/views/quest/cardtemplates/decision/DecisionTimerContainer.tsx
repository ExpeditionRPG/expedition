import {AppStateWithHistory} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {LeveledSkillCheck} from '../decision/Types';
import {ParserNode} from '../TemplateTypes';
import {handleDecisionSelect, skillTimeMillis, toDecisionCard} from './Actions';
import DecisionTimer, {DispatchProps, StateProps} from './DecisionTimer';
import {DecisionPhase, mapStateToProps as mapStateToPropsBase} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  return {
    ...mapStateToPropsBase(state, ownProps),
    roundTimeTotalMillis: skillTimeMillis(state.settings, state.multiplayer),
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onSelect: (node: ParserNode, selected: LeveledSkillCheck, elapsedMillis: number) => {
      dispatch(handleDecisionSelect({node, elapsedMillis, selected}));
      dispatch(toDecisionCard({name: 'QUEST_CARD', phase: DecisionPhase.resolve, noHistory: true}));
    },
  };
};

const DecisionTimerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DecisionTimer);

export default DecisionTimerContainer;
