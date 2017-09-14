import Redux from 'redux'
import { connect } from 'react-redux'
import {toCard} from '../actions/Card'
import {AppState} from '../reducers/StateTypes'
import RemotePlay, {RemotePlayStateProps, RemotePlayDispatchProps} from './RemotePlay'

const mapStateToProps = (state: AppState, ownProps: RemotePlayStateProps): RemotePlayStateProps => {
  return {
    card: state.card
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): RemotePlayDispatchProps => {
  return {
    onConnect: (secret: string) => {
      console.log('TODO CONNECT');
    },
    onReconnect: (id: string) => {
      console.log('TODO RECONNECT');
    },
    onNewSessionRequest: () => {
      console.log('TODO NEWSESSION');
    },
    onLockSession: () => {
      console.log('TODO LOCKSESSION');
    },
  };
}

const RemotePlayContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(RemotePlay);

export default RemotePlayContainer
