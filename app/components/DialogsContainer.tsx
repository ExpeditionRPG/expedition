import Redux from 'redux'
import {connect} from 'react-redux'

import {DialogIDType, DialogsState, AppState, QuestType} from '../reducers/StateTypes'
import {setDialog} from '../actions/dialogs'
import {publishQuest, questMetadataChange} from '../actions/quest'
import Dialogs, {DialogsStateProps, DialogsDispatchProps} from './Dialogs'

import {CONTENT_RATINGS, GENRES} from '../../node_modules/expedition-app/app/Constants'

const Joi = require('joi-browser');

const mapStateToProps = (state: AppState, ownProps: any): DialogsStateProps => {
  let open_dialogs: DialogsState = Object.assign({}, state.dialogs);
  open_dialogs['ERROR'] = Boolean(state.errors.length > 0);
  return {
    open: open_dialogs,
    quest: state.quest,
    errors: state.errors
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): DialogsDispatchProps => {
  return {
    handleMetadataChange: (quest: QuestType, key: string, value: any): void => {
      dispatch(questMetadataChange(quest, key, value));
    },
    onRequestClose: (dialog: DialogIDType): void => {
      dispatch(setDialog(dialog, false));
    },
    onRequestPublish: (quest: QuestType): void => {
      Joi.validate(quest, {
        title: Joi.string().min(4).max(100),
        summary: Joi.string().min(6).max(200),
        author: Joi.string().min(2).max(100),
        email: Joi.string().email(),
        minplayers: Joi.number().min(1).max(Joi.ref('maxplayers')),
        maxplayers: Joi.number().min(Joi.ref('minplayers')).max(6),
        mintimeminutes: Joi.number().min(1).max(Joi.ref('maxtimeminutes')),
        maxtimeminutes: Joi.number().min(Joi.ref('mintimeminutes')).max(999),
        genre: Joi.string().valid(GENRES),
        contentrating: Joi.string().valid(Object.keys(CONTENT_RATINGS)),
      }, { allowUnknown: true, abortEarly: false }, (err: string, quest: QuestType) => {
        if (err) {
          return alert(err);
        }
        dispatch(setDialog('PUBLISHING', false));
        dispatch(publishQuest(quest));
      });
    },
  };
}

const DialogsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dialogs);

export default DialogsContainer
