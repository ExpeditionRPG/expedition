import Redux from 'redux'
import {connect} from 'react-redux'
import Report, {ReportStateProps, ReportDispatchProps} from './Report'
import {MIN_FEEDBACK_LENGTH} from '../constants'
import {toPrevious} from '../actions/card'
import {login} from '../actions/user'
import {userFeedbackChange} from '../actions/UserFeedback'
import {submitUserFeedback} from '../actions/web'
import {AppState, QuestState, SettingsType, UserState, UserFeedbackState} from '../reducers/StateTypes'

declare var window:any;


const mapStateToProps = (state: AppState, ownProps: ReportStateProps): ReportStateProps => {
  return {
    quest: state.quest,
    settings: state.settings,
    user: state.user,
    userFeedback: {...state.userFeedback, type: 'report'},
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): ReportDispatchProps => {
  return {
    onChange: (key: string, value: string) => {
      const change: any = {};
      change[key] = value;
      dispatch(userFeedbackChange(change));
    },
    onSubmit: (quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState) => {
      if (!userFeedback.text) {
        return alert('Please enter a description so that we can help resolve the issue.');
      }
      if (userFeedback.text.length < MIN_FEEDBACK_LENGTH) {
        return alert('Issue description must be at least ' + MIN_FEEDBACK_LENGTH + ' characters to provide value.');
      }
      if (!user || !user.loggedIn) {
        dispatch(login((user: UserState) => {
          dispatch(submitUserFeedback(quest, settings, user, userFeedback));
        }));
      } else {
        dispatch(submitUserFeedback(quest, settings, user, userFeedback));
      }
      dispatch(toPrevious());
    },
  };
}

const ReportContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Report);

export default ReportContainer
