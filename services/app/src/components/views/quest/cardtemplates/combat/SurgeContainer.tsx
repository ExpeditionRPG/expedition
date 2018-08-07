import {toPrevious} from 'app/actions/Card';
import {AppStateWithHistory} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {ParserNode} from '../TemplateTypes';
import {
  handleResolvePhase,
} from './Actions';
import Surge, {DispatchProps, StateProps} from './Surge';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  const node = ownProps.node;
  if (!node) {
    throw Error('Incomplete props given');
  }

  // Override with dynamic state for tier and adventurer count
  // Any combat param change (e.g. change in tier) causes a repaint
  return {
    node: state.quest.node,
    settings: state.settings,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onReturn: () => {
      // Return to the "Ready for Combat?" card instead of doing the timed round again.
      dispatch(toPrevious({before: false, skip: [{name: 'QUEST_CARD', phase: 'TIMER'}]}));
    },
    onSurgeNext: (node: ParserNode) => {
      dispatch(handleResolvePhase({node}));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Surge);
