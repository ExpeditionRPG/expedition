import {connect} from 'react-redux'
import {NEW_QUEST, LOAD_QUEST} from '../actions/ActionTypes'
import {DialogIDType, DialogsState, ShareType, AppState} from '../reducers/StateTypes'
import {setDialog} from '../actions/dialogs'
import {saveQuest} from '../actions/quest'
import Dialogs, {DialogsStateProps, DialogsDispatchProps} from './Dialogs'

const mapStateToProps = (state: AppState, ownProps: any): DialogsStateProps => {
  let open_dialogs: DialogsState = Object.assign({}, state.dialogs);
  open_dialogs['ERROR'] = Boolean(state.errors.length > 0);
  return {
    open: open_dialogs,
    quest: state.quest,
    errors: state.errors
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