import { connect } from 'react-redux'
import {NEW_QUEST, LOAD_QUEST} from '../actions/ActionTypes'
import {DialogIDType, DialogsType, AppState} from '../reducers/StateTypes'
import {setDialog} from '../actions/dialog'
import {followUserAuthLink} from '../actions/user'
import {questAction, saveQuest} from '../actions/quest'
import Dialogs, {DialogsStateProps, DialogsDispatchProps} from './Dialogs'

const mapStateToProps = (state: AppState, ownProps: any): DialogsStateProps => {
  let open_dialogs: DialogsType = Object.assign({}, state.dialogs);
  open_dialogs['ERROR'] = Boolean(state.errors.length > 0);
  return {
    open: open_dialogs,
    user: state.user,
    quest: state.quest,
    errors: state.errors
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): DialogsDispatchProps => {
  return {
    onRequestClose: (dialog: DialogIDType): void => {
      dispatch(setDialog(dialog, false));
    },
    onConfirmSave: (dialog: DialogIDType, choice: boolean, id: string): void => {
      var action: any = null;
      switch(dialog) {
        case 'CONFIRM_NEW_QUEST':
          action = questAction(NEW_QUEST, true, false, null, null);
          break;
        case 'CONFIRM_LOAD_QUEST':
          action = questAction(LOAD_QUEST, true, false, null, {id: id, url: null});
          break;
        default:
          throw Error("Unknown dialog confirmation: " + dialog);
      }
      if (choice === true) {
        console.log("Dispatch with save");
        saveQuest(dispatch, id, 'XML', function(saved_id: string) {
          dispatch(action);
        });
      } else if (choice === false) {
        console.log("Dispatch without save");
        dispatch(action);
      }
    },
    onSignIn: (link: string) => {
      dispatch(followUserAuthLink(link));
    },
    onSignOut: (link: string) => {
      dispatch(followUserAuthLink(link));
    }
  };
}

const DialogsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dialogs);

export default DialogsContainer