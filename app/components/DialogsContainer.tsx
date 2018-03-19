import Redux from 'redux'
import {connect} from 'react-redux'

import {DialogIDType, DialogsState, AppState} from '../reducers/StateTypes'
import {setDialog} from '../actions/Dialogs'
import Dialogs, {DialogsStateProps, DialogsDispatchProps} from './Dialogs'

const Joi = require('joi-browser');

const mapStateToProps = (state: AppState, ownProps: any): DialogsStateProps => {
  return {
    dialogs: state.dialogs,
    user: state.user,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): DialogsDispatchProps => {
  return {
    onRequestClose: (dialog: DialogIDType): void => {
      dispatch(setDialog(dialog, false));
    },
  };
}

const DialogsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dialogs);

export default DialogsContainer
