import { connect } from 'react-redux'
import {QuestActionType} from '../actions/ActionTypes'
import {CodeViewType, DirtyType, QuestType, AppState} from '../reducers/StateTypes'
import {questAction} from '../actions/quest'
import {setDrawer} from '../actions/drawer'
import QuestList, {QuestListStateProps, QuestListDispatchProps} from './QuestList'
import {PropTypes} from 'react';

const mapStateToProps = (state: AppState, ownProps: any): QuestListStateProps => {
  return {
    quest: state.quest,
    drawer: state.drawer,
    dirty: state.dirty,
    view: state.editor.view,
    user: state.user
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestListDispatchProps => {
  return {
    onMenuSelect: (action: QuestActionType, dirty: DirtyType, view: CodeViewType, quest: QuestType) => {
      dispatch(questAction(action, false, dirty, view, quest));
    },
    onDrawerRequestChange: () => {
      dispatch(setDrawer(false));
    }
  };
}

const QuestListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestList);

export default QuestListContainer