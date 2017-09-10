import Redux from 'redux'
import {connect} from 'react-redux'

import Dialogs, {DialogsStateProps, DialogsDispatchProps} from './Dialogs'
import {toPrevious} from '../../actions/Card'
import {setDialog} from '../../actions/Dialog'
import {AppState, DialogIDType, DialogState} from '../../reducers/StateTypes'


const mapStateToProps = (state: AppState, ownProps: any): DialogsStateProps => {
  return {
    dialog: state.dialog,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): DialogsDispatchProps => {
  return {
    onExitQuest: (): void => {
      dispatch(setDialog(null));
      dispatch(toPrevious('SPLASH_CARD', undefined, false));
    },
    onRequestClose: (): void => {
      dispatch(setDialog(null));
    },
  };
}

const DialogsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dialogs);

export default DialogsContainer
