import Redux from 'redux'
import {connect} from 'react-redux'
import MultiplayerFooter, {MultiplayerFooterStateProps, MultiplayerFooterDispatchProps} from './MultiplayerFooter'
import {AppState} from '../../reducers/StateTypes'
import {setDialog} from '../../actions/Dialog'

const mapStateToProps = (state: AppState, ownProps: MultiplayerFooterStateProps): MultiplayerFooterStateProps => {
  return {
    remotePlay: state.remotePlay
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): MultiplayerFooterDispatchProps => {
  return {
    onMultiplayerExit: () => {
      dispatch(setDialog('EXIT_REMOTE_PLAY'));
    },
    onMultiplayerStatusIconTap: () => {
      dispatch(setDialog('MULTIPLAYER_STATUS'));
    }
  };
}

const MultiplayerFooterContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MultiplayerFooter);

export default MultiplayerFooterContainer;
