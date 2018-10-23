import {connect} from 'react-redux';
import Redux from 'redux';
import {MultiplayerEvent, StatusEvent} from 'shared/multiplayer/Events';
import {MultiplayerMultiEventStartAction} from '../../actions/ActionTypes';
import {local, publish, registerHandler, sendStatus, setMultiplayerConnected} from '../../actions/Multiplayer';
import {ConnectionHandler, getMultiplayerConnection} from '../../multiplayer/Connection';
import {AppState} from '../../reducers/StateTypes';
import MultiplayerClient, {DispatchProps, Props, StateProps} from './MultiplayerClient';

const mapStateToProps = (state: AppState, ownProps: Partial<Props>): StateProps => {
  return {
    conn: getMultiplayerConnection(),
    multiplayer: state.multiplayer,
    commitID: state.commitID,
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
    onStatus: (client?: string, instance?: string, status?: StatusEvent) => {
      dispatch(sendStatus(client, instance, status));
    },
    onAction: (action: any): any => {
      return dispatch(local(action));
    },
    onCommit(n: number) {
      console.log('MULTIPLAYER_COMMIT #' + n);
      dispatch({type: 'MULTIPLAYER_COMMIT', id: n});
    },
    onReject(n: number, error: string) {
      console.log('MULTIPLAYER_REJECT #' + n + ': ' + error);
      dispatch({
        type: 'MULTIPLAYER_REJECT',
        id: n,
        error,
      });
    },
    onConnectionChange(connected: boolean) {
      dispatch(setMultiplayerConnected(connected));
    },
    onPublish(e: MultiplayerEvent) {
      publish(e);
    },
    onRegisterHandler(handler: ConnectionHandler) {
      registerHandler(handler);
    },
  };
};

const MultiplayerClientContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MultiplayerClient);

export default MultiplayerClientContainer;
