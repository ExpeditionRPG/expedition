import { connect } from 'react-redux'
import {questAction, LOAD_QUEST, setDrawer} from './actions'
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
    id: state.editor.id,
    view: state.editor.view,
    dirty: state.dirty,
    open: state.drawer.open,
    quests: state.drawer.quests,
    palette: {alternateTextColor: "#FFF", primary3Color: "black"}
    // palette: state.palette
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onQuestSelect: (id, dirty, view) => {
      dispatch(questAction(LOAD_QUEST, false, id, dirty, view));
    },
    onMenuSelect: (action, id, dirty, view) => {
      dispatch(questAction(action, false, id, dirty, view));
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