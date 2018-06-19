import Redux from 'redux'
import {connect} from 'react-redux'
import {DialogIDType, AppState, QuestType} from '../reducers/StateTypes'
import {setDialog} from '../actions/Dialogs'
import {publishQuest, questMetadataChange} from '../actions/Quest'
import Dialogs, {DialogsStateProps, DialogsDispatchProps} from './Dialogs'
import {CONTENT_RATINGS, LANGUAGES, GENRES} from '@expedition-qdl/schema/Constants'

const Joi = require('joi-browser');

const mapStateToProps = (state: AppState, ownProps: any): DialogsStateProps => {
  return {
    dialogs: state.dialogs,
    quest: state.quest,
    user: state.user,
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
    onRequestPublish: (quest: QuestType, majorRelease: boolean, privatePublish: boolean): void => {
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
        contentrating: Joi.string().valid(CONTENT_RATINGS),
        expansionhorror: Joi.boolean(),
        language: Joi.string().valid(LANGUAGES),
        requirespenpaper: Joi.boolean(),
      }, { allowUnknown: true, abortEarly: false }, (err: Error, quest: QuestType) => {
        if (err) {
          return alert(err);
        }
        dispatch(setDialog('PUBLISHING', false));
        dispatch(publishQuest(quest, majorRelease, privatePublish));
      });
    },
  };
}

const DialogsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dialogs);

export default DialogsContainer
