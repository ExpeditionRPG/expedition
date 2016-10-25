import {PropTypes} from 'react'
import {connect} from 'react-redux'

import {QuestActionType} from '../actions/ActionTypes'
import {showHelp} from '../actions/dialogs'
import {setDrawer} from '../actions/drawer'
import {questAction} from '../actions/quest'
import {DirtyState, QuestType, AppState} from '../reducers/StateTypes'
import QuestDrawer, {QuestDrawerStateProps, QuestDrawerDispatchProps} from './QuestDrawer'


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
    },
    onHelpRequest: () => {
      dispatch(showHelp());
    },
  };
}

const QuestDrawerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestDrawer);

export default QuestDrawerContainer