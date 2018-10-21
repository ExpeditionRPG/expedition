import {connect} from 'react-redux';
import Redux from 'redux';
import {StatusEvent} from 'shared/multiplayer/Events';
import {MultiplayerMultiEventStartAction} from '../../actions/ActionTypes';
import {local} from '../../actions/Multiplayer';
import {getMultiplayerClient} from '../../Multiplayer';
import {AppState} from '../../reducers/StateTypes';
import MultiplayerClient, {DispatchProps, Props, StateProps} from './MultiplayerClient';

const mapStateToProps = (state: AppState, ownProps: Partial<Props>): StateProps => {
  const elem = (state.quest && state.quest.node && state.quest.node.elem);
  return {
    conn: getMultiplayerClient(),
    multiplayer: state.multiplayer,
    line: (elem && parseInt(elem.attr('data-line'), 10)),
    commitID: state.commitID,
    settings: state.settings,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onMultiEventStart: (syncID: number) => {
      dispatch(local({type: 'MULTIPLAYER_MULTI_EVENT_START', syncID} as MultiplayerMultiEventStartAction));
    },
    onMultiEventComplete: () => {
      dispatch(local({type: 'MULTIPLAYER_MULTI_EVENT'}));
    },
    onStatus: (client: string, instance: string, status: StatusEvent) => {
      dispatch({type: 'MULTIPLAYER_CLIENT_STATUS', client, instance, status});
    },
    onAction: (action: any): any => {
      return dispatch(local(action));
    },
  };
};

const MultiplayerClientContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MultiplayerClient);

export default MultiplayerClientContainer;
