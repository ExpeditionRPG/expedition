import { connect } from 'react-redux'
import {DialogIDs} from '../actions/ActionTypes'
import {setDialog} from '../actions/dialog'
import {setDrawer} from '../actions/drawer'
import QuestAppBar from './QuestAppBar'

const mapStateToProps = (state, ownProps) => {
  return {
    user_image: (state.user.profile) ? state.user.profile.image : null,
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onDrawerToggle: () => {
      dispatch(setDrawer(true));
    },
    onUserDialogRequest: () => {
      dispatch(setDialog(DialogIDs.USER, true));
    }
  };
}

const QuestAppBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestAppBar);

export default QuestAppBarContainer