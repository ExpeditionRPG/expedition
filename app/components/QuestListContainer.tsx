import { connect } from 'react-redux'
import {LOAD_QUEST} from '../actions/ActionTypes'
import {questAction} from '../actions/quest'
import {setDrawer} from '../actions/drawer'
import QuestList from './QuestList'
import {PropTypes} from 'react';

const mapStateToProps = (state: any, ownProps: any): any => {
  return {
    logged_in: Boolean(state.user.profile),
    editor: state.editor,
    quest: state.quest,
    dirty: state.dirty,
    open: state.drawer.open,
    quests: state.drawer.quests,
    palette: {alternateTextColor: "#FFF", primary3Color: "black"}
    // palette: state.palette
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): any => {
  return {
    onMenuSelect: (action: any, dirty: boolean, editor: any, quest: any) => {
      dispatch(questAction(action, false, dirty, editor, quest));
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