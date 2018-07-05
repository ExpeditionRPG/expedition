import {connect} from 'react-redux';
import Redux from 'redux';
import {toPrevious} from '../../../../../actions/Card';
import {choice} from '../../../../../actions/Quest';
import {AppStateWithHistory, SettingsType} from '../../../../../reducers/StateTypes';
import {ParserNode} from '../TemplateTypes';
import Roleplay, {RoleplayDispatchProps, RoleplayStateProps} from './Roleplay';

const mapStateToProps = (state: AppStateWithHistory, ownProps: RoleplayStateProps): RoleplayStateProps => {
  const histIdx = state._history.length - 2; // the card before this one
  const prevNode = state._history[histIdx] && state._history[histIdx].quest && state._history[histIdx].quest.node;

  return {
    node: ownProps.node, // Using this instead of state.node prevents weird errors when transitioning to / from combat
    onReturn: ownProps.onReturn,
    prevNode,
    settings: state.settings,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): RoleplayDispatchProps => {
  return {
    onChoice: (settings: SettingsType, node: ParserNode, index: number) => {
      dispatch(choice({settings, node, index}));
    },
    onRetry: () => {
      dispatch(toPrevious({name: 'QUEST_CARD', phase: 'DRAW_ENEMIES', before: true}));
    },
  };
};

const RoleplayContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Roleplay);

export default RoleplayContainer;
