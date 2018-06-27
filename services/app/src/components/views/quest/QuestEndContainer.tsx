import Redux from 'redux'
import {connect} from 'react-redux'
import QuestEnd, {QuestEndStateProps, QuestEndDispatchProps} from './QuestEnd'
import {toPrevious} from '../../../actions/Card'
import {checkoutSetState, toCheckout} from '../../../actions/Checkout'
import {openSnackbar} from '../../../actions/Snackbar'
import {exitQuest} from '../../../actions/Quest'
import {ensureLogin} from '../../../actions/User'
import {submitUserFeedback} from '../../../actions/Web'
import {AppState, QuestState, SettingsType, UserState} from '../../../reducers/StateTypes'
import {getDevicePlatform} from '../../../Globals'
import {logEvent} from '../../../Logging'

declare var window:any;


const mapStateToProps = (state: AppState, ownProps: any): QuestEndStateProps => {
  return {
    checkout: state.checkout,
    platform: getDevicePlatform(),
    quest: state.quest,
    settings: state.settings,
    user: state.user,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): QuestEndDispatchProps => {
  return {
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
    onSubmit: (quest: QuestState, settings: SettingsType, user: UserState, anonymous: boolean, text: string, rating: number|null) => {
      if (rating && rating > 0) {
        dispatch(submitUserFeedback({quest, settings, user, anonymous, text, rating, type: 'rating'}));
      }
      dispatch(exitQuest({}));
      dispatch(toPrevious({name: 'FEATURED_QUESTS'}));
    },
    onTip: (checkoutError: string|null, amount: number, quest: QuestState, settings: SettingsType, user: UserState, anonymous: boolean, text: string, rating: number|null) => {
      logEvent('tip_start', { value: amount, action: quest.details.title, label: quest.details.id });
      dispatch(ensureLogin())
        .then((user: UserState) => {
          if (rating && rating > 0) {
            dispatch(submitUserFeedback({quest, settings, user, anonymous, text, rating, type: 'rating'}));
          }
          if (checkoutError !== null) {
            dispatch(openSnackbar(Error(checkoutError)));
          } else {
            dispatch(checkoutSetState({amount, productcategory: 'Quest Tip', productid: quest.details.id}));
            dispatch(toCheckout(amount));
          }
        });
    },
  };
}

const QuestEndContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestEnd);

export default QuestEndContainer
