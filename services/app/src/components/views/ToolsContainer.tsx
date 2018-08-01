import {connect} from 'react-redux';
import Redux from 'redux';
import {audioSet} from '../../actions/Audio';
import {loadMultiplayer} from '../../actions/Multiplayer';
import {search} from '../../actions/Search';
import {ensureLogin} from '../../actions/User';
import {initCustomCombat} from '../../components/views/quest/cardtemplates/combat/Actions';
import {MUSIC_INTENSITY_MAX, URLS} from '../../Constants';
import {openWindow} from '../../Globals';
import {AppState, SettingsType, UserState} from '../../reducers/StateTypes';
import Tools, {DispatchProps, StateProps} from './Tools';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    settings: state.settings,
    user: state.user,
  };
};

export const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onCustomCombatSelect(settings: SettingsType): void {
      dispatch(initCustomCombat({}));
    },
    onQuestCreatorSelect(): void {
      openWindow(URLS.QUEST_CREATOR);
    },
    onPrivateQuestsSelect(settings: SettingsType, user: UserState): void {
      dispatch(ensureLogin())
        .then((u: UserState) => {
          return dispatch(search({
            search: {
              order: '-published',
              owner: u.id,
              partition: 'expedition-private',
            },
            settings: {
              ...settings,
              contentSets: {
                horror: true,
              },
            },
          }));
        });
    },
    onMultiplayerSelect(user: UserState): void {
      dispatch(ensureLogin())
        .then((u: UserState) => {
          dispatch(loadMultiplayer(user));
        });
    },
    testMusic(): void {
      const intensity = Number(prompt(`Enter intensity (0-${MUSIC_INTENSITY_MAX})`));
      if (intensity) {
        dispatch(audioSet({intensity}));
      }
    },
  };
};

const ToolsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Tools);

export default ToolsContainer;
