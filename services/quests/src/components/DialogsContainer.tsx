import {connect} from 'react-redux';
import Redux from 'redux';
import {CONTENT_RATINGS, GENRES, LANGUAGES} from 'shared/schema/Constants';
import {setDialog} from '../actions/Dialogs';
import {publishQuest, questMetadataChange} from '../actions/Quest';
import {AppState, DialogIDType, QuestType} from '../reducers/StateTypes';
import Dialogs, {DialogsDispatchProps, DialogsStateProps} from './Dialogs';

const Joi = require('joi-browser');

const mapStateToProps = (state: AppState): DialogsStateProps => {
  return {
    dialogs: state.dialogs,
    quest: state.quest,
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DialogsDispatchProps => {
  return {
    handleMetadataChange: (quest: QuestType, key: string, value: any): void => {
      dispatch(questMetadataChange(quest, key, value));
      if (key === 'expansionfuture' && value) {
        dispatch(questMetadataChange(quest, 'expansionhorror', true));
      }
    },
    onClose: (dialog: DialogIDType): void => {
      dispatch(setDialog(dialog, false));
    },
    onRequestPublish: (quest: QuestType, majorRelease: boolean, privatePublish: boolean): void => {
      Joi.validate(quest, {
        author: Joi.string().min(2).max(100),
        contentrating: Joi.string().valid(CONTENT_RATINGS),
        email: Joi.string().email(),
        expansionhorror: Joi.boolean(),
        expansionfuture: Joi.boolean(),
        genre: Joi.string().valid(GENRES),
        language: Joi.string().valid(LANGUAGES),
        maxplayers: Joi.number().min(Joi.ref('minplayers')).max(6),
        maxtimeminutes: Joi.number().min(Joi.ref('mintimeminutes')).max(999),
        minplayers: Joi.number().min(1).max(Joi.ref('maxplayers')),
        mintimeminutes: Joi.number().min(1).max(Joi.ref('maxtimeminutes')),
        requirespenpaper: Joi.boolean(),
        summary: Joi.string().min(6).max(200),
        title: Joi.string().min(4).max(100),
      }, { allowUnknown: true, abortEarly: false }, (err: Error, validated: QuestType) => {
        if (err) {
          return alert(err);
        }
        dispatch(setDialog('PUBLISHING', false));
        dispatch(publishQuest(validated, majorRelease, privatePublish));
      });
    },
  };
};

const DialogsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dialogs);

export default DialogsContainer;
