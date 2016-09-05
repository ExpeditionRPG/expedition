import { connect } from 'react-redux'
import {setDialog, DialogIDs, toggleDrawer, signIn, signOut} from './actions'
import Dialogs from './Dialogs'

const mapStateToProps = (state, ownProps) => {
  return {
    open: {...state.dialogs, [DialogIDs.ERROR]: Boolean(state.errors.length > 0)},
    user_name: (state.user.profile) ? state.user.profile.displayName : null,
    short_url: null,
    errors: state.errors
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onRequestClose: (dialog) => {
      dispatch(setDialog(dialog, false));
    },
    onConfirm: (dialog) => {
      switch(dialog) {
        case CONFIRM_NEW_QUEST:
          return dispatch(questAction(QuestActions.NEW));
        case CONFIRM_DELETE_QUEST:
          return dispatch(questAction(QuestActions.DELETE));
        default:
          throw Error("Unknown dialog confirmation: " + dialog);
      }
    },
    onSignIn: () => {
      dispatch(signOut());
    },
    onSignOut: () => {
      dispatch(signIn());
    }
  };
}

const DialogsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dialogs);

export default DialogsContainer