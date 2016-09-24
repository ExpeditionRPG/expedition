import { connect } from 'react-redux'
import {showHelp} from '../actions/dialogs'
import {setDrawer} from '../actions/drawer'
import {logoutUser, loginUser} from '../actions/user'
import {AppState, UserType} from '../reducers/StateTypes'
import QuestAppBar, {QuestAppBarStateProps, QuestAppBarDispatchProps} from './QuestAppBar'

const mapStateToProps = (state: AppState, ownProps: any): QuestAppBarStateProps => {
  return {user: state.user};
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestAppBarDispatchProps => {
  return {
    onDrawerToggle: (user: UserType) => {
      dispatch(setDrawer(user.id, true));
    },
    onUserDialogRequest: (user: UserType) => {
      if (user.id) {
        dispatch(logoutUser());
      } else {
        dispatch(loginUser());
      }
    },
    onHelpRequest: () => {
      dispatch(showHelp());
    }
  };
}

const QuestAppBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestAppBar);

export default QuestAppBarContainer;