import {toPrevious} from 'app/actions/Card';
import {choice} from 'app/actions/Quest';
import {AppStateWithHistory, SettingsType} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {ParserNode} from '../TemplateTypes';
import Roleplay, {DispatchProps, Props, StateProps} from './Roleplay';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<Props>): StateProps => {
  const histIdx = state._history.length - 2; // the card before this one
  const prevNode = state._history[histIdx] && state._history[histIdx].quest && state._history[histIdx].quest.node;

  if (ownProps.node === undefined) {
    throw Error('Node not given');
  }

  return {
    node: ownProps.node, // Using this instead of state.node prevents weird errors when transitioning to / from combat
    questID: state.quest.details.id,
    onReturn: ownProps.onReturn,
    prevNode,
    settings: state.settings,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onChoice: (settings: SettingsType, node: ParserNode, index: number) => {
      dispatch(choice({node, index}));
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
