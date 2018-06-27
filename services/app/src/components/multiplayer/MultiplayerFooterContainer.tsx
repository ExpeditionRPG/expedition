import {connect} from 'react-redux';
import Redux from 'redux';
import {setDialog} from '../../actions/Dialog';
import {AppState} from '../../reducers/StateTypes';
import MultiplayerFooter, {MultiplayerFooterDispatchProps, MultiplayerFooterStateProps} from './MultiplayerFooter';

const mapStateToProps = (state: AppState, ownProps: MultiplayerFooterStateProps): MultiplayerFooterStateProps => {
  return {
    multiplayer: state.multiplayer,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): MultiplayerFooterDispatchProps => {
  return {
    onMultiplayerExit: () => {
      dispatch(setDialog('EXIT_REMOTE_PLAY'));
    },
    onMultiplayerStatusIconTap: () => {
      dispatch(setDialog('MULTIPLAYER_STATUS'));
    },
  };
};

const MultiplayerFooterContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MultiplayerFooter);

export default MultiplayerFooterContainer;
