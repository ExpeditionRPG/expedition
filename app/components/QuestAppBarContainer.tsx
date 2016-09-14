import { connect } from 'react-redux'
import {showHelp} from '../actions/dialog'
import {setDrawer} from '../actions/drawer'
import {followUserAuthLink} from '../actions/user'
import {AppState, UserType} from '../reducers/StateTypes'
import QuestAppBar, {QuestAppBarStateProps, QuestAppBarDispatchProps} from './QuestAppBar'

const mapStateToProps = (state: AppState, ownProps: any): QuestAppBarStateProps => {
  return {user: state.user};
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestAppBarDispatchProps => {
  return {
    onDrawerToggle: () => {
      dispatch(setDrawer(true));
    },
    onUserDialogRequest: (user: UserType) => {
      if (user.profile) {
        dispatch(followUserAuthLink(user.logout));
      } else {
        dispatch(followUserAuthLink(user.login));
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