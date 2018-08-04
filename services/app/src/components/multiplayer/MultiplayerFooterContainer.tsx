import {connect} from 'react-redux';
import Redux from 'redux';
import {setDialog} from '../../actions/Dialog';
import {AppState} from '../../reducers/StateTypes';
import MultiplayerFooter, {DispatchProps, Props, StateProps} from './MultiplayerFooter';

const mapStateToProps = (state: AppState, ownProps: Partial<Props>): StateProps => {
  return {
    multiplayer: state.multiplayer,
    theme: ownProps.theme || 'light',
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
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
