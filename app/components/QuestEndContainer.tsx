import Redux from 'redux'
import {connect} from 'react-redux'
import QuestEnd, {QuestEndStateProps, QuestEndDispatchProps} from './QuestEnd'
import {toCard, toPrevious} from '../actions/card'
import {login} from '../actions/user'
import {userFeedbackChange} from '../actions/UserFeedback'
import {submitUserFeedback} from '../actions/web'
import {authSettings, MIN_FEEDBACK_LENGTH} from '../constants'
import {AppState, QuestState, SettingsType, UserState, UserFeedbackState} from '../reducers/StateTypes'

declare var window:any;


const mapStateToProps = (state: AppState, ownProps: any): QuestEndStateProps => {
  return {
    quest: state.quest,
    settings: state.settings,
    user: state.user,
    userFeedback: {...state.userFeedback, type: 'rating'},
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestEndDispatchProps => {
  return {
    onChange: (key: string, value: any) => {
      const change: any = {};
      change[key] = value;
      dispatch(userFeedbackChange(change));
    },
    onShare: (quest: QuestState) => {
      const options = {
        message: `I just had a blast playing the Expedition quest ${quest.details.title}! #ExpeditionRPG`, // not supported on some apps (Facebook, Instagram)
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
    onSubmit: (quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState) => {
      if (userFeedback.rating && userFeedback.rating > 0) {
        if (userFeedback.text.length > 0 && userFeedback.text.length < MIN_FEEDBACK_LENGTH) {
          return alert('Reviews must be at least ' + MIN_FEEDBACK_LENGTH + ' characters to provide value.');
        }
        if (!user || !user.loggedIn) {
          dispatch(login((user: UserState) => {
            dispatch(submitUserFeedback(quest, settings, user, userFeedback));
          }));
        } else {
          dispatch(submitUserFeedback(quest, settings, user, userFeedback));
        }
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
