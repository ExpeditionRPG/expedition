import { connect } from 'react-redux'
import {QuestActionType} from '../actions/ActionTypes'
import {DirtyState, QuestType, AppState} from '../reducers/StateTypes'
import {questAction} from '../actions/quest'
import {setDrawer} from '../actions/drawer'
import QuestDrawer, {QuestDrawerStateProps, QuestDrawerDispatchProps} from './QuestDrawer'
import {PropTypes} from 'react';

const mapStateToProps = (state: AppState, ownProps: any): QuestDrawerStateProps => {
  return {
    quest: state.quest,
    drawer: state.drawer,
    dirty: state.dirty,
    user: state.user
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestDrawerDispatchProps => {
  return {
    onMenuSelect: (action: QuestActionType, dirty: DirtyState, quest: QuestType) => {
      dispatch(questAction(action, false, dirty, quest));
    },
    onDrawerRequestChange: () => {
      dispatch(setDrawer("", false));
    }
  };
}

const QuestDrawerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestDrawer);

export default QuestDrawerContainer