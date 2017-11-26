import Redux from 'redux'
import {connect} from 'react-redux'
import RemoteFooter, {RemoteFooterStateProps, RemoteFooterDispatchProps} from './RemoteFooter'
import {AppState} from '../../../reducers/StateTypes'

const mapStateToProps = (state: AppState, ownProps: RemoteFooterStateProps): RemoteFooterStateProps => {
  return {
    remotePlay: state.remotePlay
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): RemoteFooterDispatchProps => {
  return {
  };
}

const RemoteFooterContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(RemoteFooter);

export default RemoteFooterContainer;
