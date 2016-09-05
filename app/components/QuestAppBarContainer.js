import { connect } from 'react-redux'
import {setDialog, DialogIDs, toggleDrawer} from './actions'
import QuestAppBar from './QuestAppBar'

const mapStateToProps = (state, ownProps) => {
  return {
    user_image: (state.user) ? state.user.image : null,
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onDrawerToggle: () => {
      dispatch(toggleDrawer());
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