import Redux from 'redux'
import {connect} from 'react-redux'
import QuestEnd, {QuestEndStateProps, QuestEndDispatchProps} from './QuestEnd'
import {toCard, toPrevious} from '../actions/Card'
import {checkoutSetState, toCheckout} from '../actions/Checkout'
import {openSnackbar} from '../actions/Snackbar'
import {login} from '../actions/User'
import {userFeedbackChange} from '../actions/UserFeedback'
import {submitUserFeedback} from '../actions/Web'
import {authSettings} from '../Constants'
import {AppState, QuestState, SettingsType, UserState, UserFeedbackState} from '../reducers/StateTypes'
import {getDevicePlatform} from '../Globals'
import {logEvent} from '../Main'

declare var window:any;


const mapStateToProps = (state: AppState, ownProps: any): QuestEndStateProps => {
  return {
    checkout: state.checkout,
    platform: getDevicePlatform(),
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
        logEvent('share', { ...quest.details, label: result.app });
      }
      const onError = function(msg: string) {
        logEvent('share_error', { label: msg });
      }
      window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
    },
    onSubmit: (quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState) => {
      if (userFeedback.rating && userFeedback.rating > 0) {
        dispatch(submitUserFeedback({quest, settings, user, userFeedback}));
      }
      dispatch(toPrevious({name: 'FEATURED_QUESTS'}));
    },
    onTip: (checkoutError: string, amount: number, quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState) => {
      logEvent('tip_start', { value: amount, action: quest.details.title, label: quest.details.id });
      if (!user || !user.loggedIn) {
        dispatch(login({callback: (user: UserState) => {
          dispatch(submitUserFeedback({quest, settings, user, userFeedback}));
          if (checkoutError !== null) {
            dispatch(openSnackbar(checkoutError));
          } else {
            dispatch(checkoutSetState({amount, productcategory: 'Quest Tip', productid: quest.details.id}));
            dispatch(toCheckout(user, amount));
          }
        }}));
      } else {
        dispatch(submitUserFeedback({quest, settings, user, userFeedback}));
        if (checkoutError !== null) {
          dispatch(openSnackbar(checkoutError));
        } else {
          dispatch(checkoutSetState({amount, productcategory: 'Quest Tip', productid: quest.details.id}));
          dispatch(toCheckout(user, amount));
        }
      }
    },
  };
}

const QuestEndContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestEnd);

export default QuestEndContainer
