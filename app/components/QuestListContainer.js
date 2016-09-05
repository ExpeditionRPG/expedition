import { connect } from 'react-redux'
import {questAction, LOAD_QUEST, toggleDrawer} from './actions'
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
    open: state.drawer.open,
    quests: state.drawer.quests,
    palette: {alternateTextColor: "#FFF", primary3Color: "black"}
    // palette: state.palette
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onQuestSelect: (id) => {
      dispatch(questAction(LOAD_QUEST, id));
    },
    onMenuSelect: (evt, action) => {
      dispatch(questAction(action));
    },
    onDrawerRequestChange: (drawer_state) => {
      dispatch(toggleDrawer());
    }
  };
}

const QuestListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestList);

export default QuestListContainer