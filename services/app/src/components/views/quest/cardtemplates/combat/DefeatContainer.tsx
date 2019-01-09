import {toPrevious} from 'app/actions/Card';
import {event} from 'app/actions/Quest';
import {AppStateWithHistory} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {resolveCombat} from '../Params';
import {ParserNode} from '../TemplateTypes';
import Defeat, {DispatchProps, StateProps} from './Defeat';
import {mapStateToProps as mapStateToPropsBase} from './Types';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  // Override with dynamic state for tier and adventurer count
  // Any combat param change (e.g. change in tier) causes a repaint
  return {
    ...mapStateToPropsBase(state, ownProps),
    combat: resolveCombat(ownProps.node),
    mostRecentRolls: resolveCombat(state.quest.node).mostRecentRolls,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onEvent: (node: ParserNode, evt: string) => {
      dispatch(event({node, evt}));
    },
    onRetry: () => {
      dispatch(toPrevious({name: 'QUEST_CARD', phase: 'DRAW_ENEMIES', before: true}));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Defeat);
