import {connect} from 'react-redux'
import QuestEnd, {QuestEndStateProps, QuestEndDispatchProps} from './QuestEnd'
import {toCard, toPrevious} from '../actions/card'
import {updateFeedback} from '../actions/quest'
import {sendFeedback} from '../actions/web'
import {authSettings} from '../constants'
import {AppState, SettingsType, QuestState, XMLElement} from '../reducers/StateTypes'

declare var window:any;


const MIN_FEEDBACK_LENGTH = 20;

const mapStateToProps = (state: AppState, ownProps: any): QuestEndStateProps => {
  return {
    quest: state.quest,
    settings: state.settings,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestEndDispatchProps => {
  return {
    onCommentChange: (text: string) => {
      dispatch(updateFeedback(text));
    },
    onShare: (quest: QuestState) => {
      const options = {
        message: `I just had a blast playing the Expedition RPG quest ${quest.details.title}!`, // not supported on some apps (Facebook, Instagram)
        subject: 'Expedition: The Roleplaying Card Game',
        url: 'https://ExpeditionGame.com',
      };
      const onSuccess = function(result: any) {
        window.FirebasePlugin.logEvent('share', Object.assign({}, quest.details, {app: result.app}));
      }
      const onError = function(msg: string) {
        window.FirebasePlugin.logEvent('share_error', {error: msg});
      }
      window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
    },
    onSubmit: (quest: QuestState, settings: SettingsType) => {
      const feedback = quest.feedback || '';
      if (feedback.length > 0 && feedback.length < MIN_FEEDBACK_LENGTH) {
        return alert('More feedback required: Feedback must be at least ' + MIN_FEEDBACK_LENGTH + ' characters to provide value to the quest writer');
      } else if (feedback.length > MIN_FEEDBACK_LENGTH) {
        dispatch(sendFeedback(quest, settings));
      }
      window.FirebasePlugin.logEvent('quest_end', quest.details);
      dispatch(toPrevious('QUEST_START', undefined, true));
    },
  };
}

const QuestEndContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestEnd);

export default QuestEndContainer
