import {connect} from 'react-redux';
import Redux from 'redux';
import {MultiplayerEvent, StatusEvent} from 'shared/multiplayer/Events';
import {handleEvent, registerHandler, rejectEvent, sendStatus, setMultiplayerConnected} from '../../actions/Multiplayer';
import {ConnectionHandler} from '../../multiplayer/Connection';
import {AppState, MultiplayerState} from '../../reducers/StateTypes';
import MultiplayerClient, {DispatchProps, Props, StateProps} from './MultiplayerClient';

const mapStateToProps = (state: AppState, ownProps: Partial<Props>): StateProps => {
  return {
    multiplayer: state.multiplayer,
    commitID: state.commitID,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onStatus: (client?: string, instance?: string, status?: StatusEvent) => {
      dispatch(sendStatus(client, instance, status));
    },
    onEvent: (e: MultiplayerEvent, buffered: boolean, commitID: number, multiplayer: MultiplayerState) => {
      dispatch(handleEvent(e, buffered, commitID, multiplayer));
    },
    onReject(n: number, error: string) {
      dispatch(rejectEvent(n, error));
    },
    onConnectionChange(connected: boolean) {
      dispatch(setMultiplayerConnected(connected));
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
