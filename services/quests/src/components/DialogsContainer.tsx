import {connect} from 'react-redux';
import Redux from 'redux';
import {ContentRating, enumValues, Genre, Language} from 'shared/schema/Constants';
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
    handleMetadataChange: (quest: QuestType, delta: Partial<QuestType>): void => {
      if (delta.expansionfuture) {
        delta.expansionhorror = true;
      }
      dispatch(questMetadataChange(quest, delta));
    },
    onClose: (dialog: DialogIDType): void => {
      dispatch(setDialog(dialog, false));
    },
    onRequestPublish: (quest: QuestType, majorRelease: boolean, privatePublish: boolean): void => {
      Joi.validate(quest, {
        author: Joi.string().min(2).max(100),
        contentrating: Joi.string().valid(enumValues(ContentRating)),
        email: Joi.string().email(),
        expansionhorror: Joi.boolean(),
        expansionfuture: Joi.boolean(),
        expansionwyrmsgiants: Joi.boolean(),
        expansionscarredlands: Joi.boolean(),
        genre: Joi.string().valid(enumValues(Genre)),
        language: Joi.string().valid(enumValues(Language)),
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
