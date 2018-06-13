import Redux from 'redux'
import {connect} from 'react-redux'
import {AppStateWithHistory, SettingsType} from '../../../../../reducers/StateTypes'
import {toPrevious} from '../../../../../actions/Card'
import {choice} from '../../../../../actions/Quest'
import Roleplay, {RoleplayStateProps, RoleplayDispatchProps} from './Roleplay'
import {ParserNode} from '../TemplateTypes'

const mapStateToProps = (state: AppStateWithHistory, ownProps: RoleplayStateProps): RoleplayStateProps => {
  const histIdx = state._history.length - 2; // the card before this one
  const prevNode = state._history[histIdx] && state._history[histIdx].quest && state._history[histIdx].quest.node;

  return {
    node: ownProps.node, // Using this instead of state.node prevents weird errors when transitioning to / from combat
    prevNode,
    settings: state.settings,
    onReturn: ownProps.onReturn,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): RoleplayDispatchProps => {
  return {
    onChoice: (settings: SettingsType, node: ParserNode, index: number) => {
      dispatch(choice({settings, node, index}));
    },
    onRetry: () => {
      dispatch(toPrevious({name: 'QUEST_CARD', phase: 'DRAW_ENEMIES', before: true}));
    },
  };
}

const RoleplayContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Roleplay);

export default RoleplayContainer;
