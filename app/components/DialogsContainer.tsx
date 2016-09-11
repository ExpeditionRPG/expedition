import { connect } from 'react-redux'
import {NEW_QUEST, LOAD_QUEST, DialogIDType} from '../actions/ActionTypes'
import {setDialog} from '../actions/dialog'
import {followUserAuthLink} from '../actions/user'
import {questAction, saveQuest} from '../actions/quest'
import Dialogs from './Dialogs'

const mapStateToProps = (state: any, ownProps: any): any => {
  let open_dialogs: any = Object.assign({}, state.dialogs);
  open_dialogs['ERROR'] = Boolean(state.errors.length > 0);
  return {
    open: open_dialogs,
    user_name: (state.user.profile) ? state.user.profile.displayName : null,
    login_url: state.user.login,
    logout_url: state.user.logout,
    short_url: state.shorturl,
    id: state.editor.id,
    errors: state.errors
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): any => {
  return {
    onRequestClose: (dialog: DialogIDType) => {
      dispatch(setDialog(dialog, false));
    },
    onConfirmSave: (dialog: DialogIDType, choice: boolean, id: string) => {
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
        return saveQuest(dispatch, id, 'XML', function(saved_id: string) {
          dispatch(action);
        });
      } else if (choice === false) {
        console.log("Dispatch without save");
        return dispatch(action);
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