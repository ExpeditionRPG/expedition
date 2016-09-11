import { connect } from 'react-redux'
import {setDialog} from '../actions/dialog'
import {setDrawer} from '../actions/drawer'
import {AppState} from '../reducers/StateTypes'
import QuestAppBar, {QuestAppBarStateProps, QuestAppBarDispatchProps} from './QuestAppBar'

const mapStateToProps = (state: AppState, ownProps: any): QuestAppBarStateProps => {
  return {user: state.user};
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestAppBarDispatchProps => {
  return {
    onDrawerToggle: () => {
      dispatch(setDrawer(true));
    },
    onUserDialogRequest: () => {
      dispatch(setDialog('USER', true));
    }
  };
}

const QuestAppBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestAppBar);

export default QuestAppBarContainer;