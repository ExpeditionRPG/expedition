import Redux from 'redux'
import {connect} from 'react-redux'

import {DialogIDType, DialogsState, AppState} from '../reducers/StateTypes'
import {setDialog} from '../actions/Dialogs'
import Dialogs, {DialogsStateProps, DialogsDispatchProps} from './Dialogs'

const Joi = require('joi-browser');

const mapStateToProps = (state: AppState, ownProps: any): DialogsStateProps => {
  return {
    dialogs: state.dialogs,
    feedback: (state.view.selected.feedback !== null) ? state.view.feedback[state.view.selected.feedback] : null,
    quest: (state.view.selected.quest !== null) ? state.view.quests[state.view.selected.quest] : null,
    user: (state.view.selected.user !== null) ? state.view.users[state.view.selected.user] : null,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): DialogsDispatchProps => {
  return {
    onRequestClose: (dialog: DialogIDType): void => {
      switch (dialog) {
        case 'FEEDBACK_DETAILS':
          dispatch({type: 'SELECT_ROW', table: 'feedback', row: null});
          break;
        case 'QUEST_DETAILS':
          dispatch({type: 'SELECT_ROW', table: 'user', row: null});
          break;
        case 'USER_DETAILS':
          dispatch({type: 'SELECT_ROW', table: 'user', row: null});
          break;
        default:
          break;
      }
      dispatch(setDialog('NONE'));
    },
  };
}

const DialogsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dialogs);

export default DialogsContainer
