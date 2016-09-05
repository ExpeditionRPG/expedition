import { connect } from 'react-redux'
import {setDialog, DialogIDs, setDrawer} from './actions'
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