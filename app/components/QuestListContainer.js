import { connect } from 'react-redux'
import {LOAD_QUEST} from '../actions/ActionTypes'
import {questAction} from '../actions/quest'
import {setDrawer} from '../actions/drawer'
import QuestList from './QuestList'
import {PropTypes} from 'react';

var buffer;

/*
QuestIDE.contextTypes = {
  muiTheme: PropTypes.object.isRequired,
};
*/

const mapStateToProps = (state, ownProps) => {
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

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onMenuSelect: (action, dirty, editor, quest) => {
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