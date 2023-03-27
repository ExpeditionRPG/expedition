import {toPrevious} from 'app/actions/Card';
import {checkoutSetState, toCheckout} from 'app/actions/Checkout';
import {setMultiplayerStatus} from 'app/actions/Multiplayer';
import {exitQuest} from 'app/actions/Quest';
import {openSnackbar} from 'app/actions/Snackbar';
import {submitUserFeedback} from 'app/actions/Web';
import {getDevicePlatform} from 'app/Globals';
import {logEvent} from 'app/Logging';
import {AppState, CardName, MultiplayerState, QuestState, SettingsType, UserState} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import {ParserNode} from './cardtemplates/TemplateTypes';
import QuestEnd, {DispatchProps, StateProps} from './QuestEnd';

declare var window: any;

const mapStateToProps = (state: AppState): StateProps => {
  return {
    checkout: state.checkout,
    platform: getDevicePlatform(),
    quest: state.quest,
    settings: state.settings,
    user: state.user,
    showSharing: window.plugins && window.plugins.socialsharing,
    multiplayer: state.multiplayer,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onShare: (quest: QuestState) => {
      const options = {
        message: `I just had a blast playing the Expedition quest ${quest.details.title}! #ExpeditionRPG`, // not supported on some apps (Facebook, Instagram)
        subject: 'Expedition: The Roleplaying Card Game',
        url: 'https://ExpeditionGame.com',
      };
      const onSuccess = (result: any) => {
        logEvent('valuable', 'share', { ...quest.details, label: result.app });
      };
      const onError = (msg: string) => {
        logEvent('error', 'share_error', { label: msg });
      };
      window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
    },
    onSubmit: (quest: QuestState, settings: SettingsType, user: UserState, multiplayer: MultiplayerState, anonymous: boolean, text: string, rating: number|null) => {
      if (rating && rating > 0) {
        dispatch(submitUserFeedback({quest, settings, user, anonymous, text, rating, type: 'rating'}));
      }

      if (!multiplayer.session) {
        dispatch(toPrevious({
          matchFn: (c: CardName, n: ParserNode) => c !== 'QUEST_CARD' && c !== 'QUEST_SETUP',
        }));
        dispatch(exitQuest({}));
      } else {
        dispatch(setMultiplayerStatus({
          type: 'STATUS',
          waitingOn: {
            type: 'REVIEW',
          },
        }));
      }
    },
    onTip: (checkoutError: string|null, amount: number, user: UserState, quest: QuestState, settings: SettingsType, anonymous: boolean, text: string, rating: number|null) => {
      logEvent('navigate', 'tip_start', {value: amount, action: quest.details.title, label: quest.details.id});
      if (rating && rating > 0) {
        dispatch(submitUserFeedback({quest, settings, user, anonymous, text, rating, type: 'rating'}));
      }
      if (checkoutError !== null) {
        dispatch(openSnackbar(Error(checkoutError)));
      } else {
        dispatch(checkoutSetState({amount, productcategory: 'Quest Tip', productid: quest.details.id}));
        dispatch(toCheckout(amount));
      }
    },
  };
};

const QuestEndContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestEnd);

export default QuestEndContainer;
