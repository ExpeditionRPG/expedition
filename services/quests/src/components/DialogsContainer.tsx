import { connect } from 'react-redux';
import Redux from 'redux';
import {
  ContentRating,
  enumValues,
  Genre,
  Language,
} from 'shared/schema/Constants';
import { setDialog } from '../actions/Dialogs';
import { publishQuest, questMetadataChange } from '../actions/Quest';
import { AppState, DialogIDType, QuestType } from '../reducers/StateTypes';
import Dialogs, { DialogsDispatchProps, DialogsStateProps } from './Dialogs';

// joi ships a browser build (package.json `browser` -> dist/joi-browser.min.js)
// which webpack resolves for this bundle, so the joi-browser fork is gone.
import * as Joi from 'joi';

const mapStateToProps = (state: AppState): DialogsStateProps => {
  return {
    dialogs: state.dialogs,
    quest: state.quest,
    user: state.user,
  };
};

export const mapDispatchToProps = (
  dispatch: Redux.Dispatch<any>,
): DialogsDispatchProps => {
  return {
    handleMetadataChange: (
      quest: QuestType,
      delta: Partial<QuestType>,
    ): void => {
      if (delta.expansionfuture) {
        delta.expansionhorror = true;
      }
      dispatch(questMetadataChange(quest, delta));
    },
    onClose: (dialog: DialogIDType): void => {
      dispatch(setDialog(dialog, false));
    },
    onRequestPublish: (
      quest: QuestType,
      majorRelease: boolean,
      privatePublish: boolean,
    ): void => {
      // joi 16 removed `Joi.validate(value, schema, options, cb)` in favour of
      // `schema.validate(value, options)`, which is synchronous. `.valid()`
      // also became varargs (it used to flatten a single array argument), and
      // `email()` would otherwise start checking the domain against the IANA
      // TLD list, which joi 13 did not do.
      const result = Joi.object({
        author: Joi.string().min(2).max(100),
        contentrating: Joi.string().valid(...enumValues(ContentRating)),
        email: Joi.string().email({ tlds: { allow: false } }),
        expansionhorror: Joi.boolean(),
        expansionfuture: Joi.boolean(),
        expansionwyrmsgiants: Joi.boolean(),
        expansionscarredlands: Joi.boolean(),
        genre: Joi.string().valid(...enumValues(Genre)),
        language: Joi.string().valid(...enumValues(Language)),
        maxplayers: Joi.number().min(Joi.ref('minplayers')).max(6),
        maxtimeminutes: Joi.number().min(Joi.ref('mintimeminutes')).max(999),
        // Each maximum already checks its minimum. References in both
        // directions create a dependency cycle in Joi 16+.
        minplayers: Joi.number().min(1),
        mintimeminutes: Joi.number().min(1),
        requirespenpaper: Joi.boolean(),
        summary: Joi.string().min(6).max(200),
        title: Joi.string().min(4).max(100),
      }).validate(quest, { allowUnknown: true, abortEarly: false });
      if (result.error) {
        return alert(result.error);
      }
      const validated: QuestType = result.value;
      dispatch(setDialog('PUBLISHING', false));
      dispatch(publishQuest(validated, majorRelease, privatePublish));
    },
  };
};

const DialogsContainer = connect(mapStateToProps, mapDispatchToProps)(Dialogs);

export default DialogsContainer;
