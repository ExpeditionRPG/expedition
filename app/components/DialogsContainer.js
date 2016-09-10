import { connect } from 'react-redux'
import {NEW_QUEST, LOAD_QUEST, DialogIDs} from '../actions/ActionTypes'
import {setDialog} from '../actions/dialog'
import {followUserAuthLink} from '../actions/user'
import {questAction} from '../actions/quest'
import Dialogs from './Dialogs'

const mapStateToProps = (state, ownProps) => {
  console.log("Login " + state.user.login);
  return {
    open: {...state.dialogs, [DialogIDs.ERROR]: Boolean(state.errors.length > 0)},
    user_name: (state.user.profile) ? state.user.profile.displayName : null,
    login_url: state.user.login,
    logout_url: state.user.logout,
    short_url: state.shorturl,
    id: state.editor.id,
    xml: state.editor.xml,
    errors: state.errors
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onRequestClose: (dialog) => {
      dispatch(setDialog(dialog, false));
    },
    onConfirmSave: (dialog, choice, id, xml) => {
      var action = null;
      switch(dialog) {
        case DialogIDs.CONFIRM_NEW_QUEST:
          action = questAction(NEW_QUEST, true);
          break;
        case DialogIDs.CONFIRM_LOAD_QUEST:
          action = questAction(LOAD_QUEST, true, id);
          break;
        default:
          throw Error("Unknown dialog confirmation: " + dialog);
      }
      if (choice === true) {
        console.log("Dispatch with save");
        // TODO make quest action
        /*
        return saveQuest(dispatch, id, xml, function(saved_id) {
          dispatch(action);
        });
        */
      } else if (choice === false) {
        console.log("Dispatch without save");
        return dispatch(action);
      }
    },
    onSignIn: (link) => {
      dispatch(followUserAuthLink(link));
    },
    onSignOut: (link) => {
      dispatch(followUserAuthLink(link));
    }
  };
}

const DialogsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dialogs);

export default DialogsContainer