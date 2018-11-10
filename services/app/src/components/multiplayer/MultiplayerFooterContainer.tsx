import {connect} from 'react-redux';
import Redux from 'redux';
import {setDialog} from '../../actions/Dialog';
import {syncMultiplayer} from '../../actions/Multiplayer';
import {AppState, DialogIDType} from '../../reducers/StateTypes';
import MultiplayerFooter, {DispatchProps, Props, StateProps} from './MultiplayerFooter';

const mapStateToProps = (state: AppState, ownProps: Partial<Props>): StateProps => {
  return {
    multiplayer: state.multiplayer,
    cardTheme: ownProps.cardTheme || 'light',
    questTheme: state.quest.details.theme || 'base',
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    setDialog: (name: DialogIDType) => {
      dispatch(setDialog(name));
    },
    onSync: () => {
      dispatch(syncMultiplayer());
    },
  };
};

const MultiplayerFooterContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MultiplayerFooter);

export default MultiplayerFooterContainer;
