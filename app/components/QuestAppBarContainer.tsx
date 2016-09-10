import { connect } from 'react-redux'
import {setDialog} from '../actions/dialog'
import {setDrawer} from '../actions/drawer'
import QuestAppBar from './QuestAppBar'

const mapStateToProps = (state: any, ownProps: any): any => {
  return {
    user_image: (state.user.profile) ? state.user.profile.image : null,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): any => {
  return {
    onDrawerToggle: () => {
      dispatch(setDrawer(true));
    },
    onUserDialogRequest: () => {
      dispatch(setDialog('USER', true));
    }
  };
}

export const QuestAppBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestAppBar);