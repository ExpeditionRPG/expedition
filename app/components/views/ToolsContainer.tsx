import Redux from 'redux'
import {connect} from 'react-redux'
import Tools, {ToolsStateProps, ToolsDispatchProps} from './Tools'
import {AppState, SettingsType, UserState} from '../../reducers/StateTypes'
import {initCustomCombat} from '../../components/views/quest/cardtemplates/combat/Actions'
import {audioSetIntensity, audioPlaySfx} from '../../actions/Audio'
import {toCard} from '../../actions/Card'
import {search} from '../../actions/Search'
import {openSnackbar} from '../../actions/Snackbar'
import {login} from '../../actions/User'
import {URLS, MUSIC_INTENSITY_MAX} from '../../Constants'
import {openWindow} from '../../Globals'
import {getStore} from '../../Store'
import {loadMultiplayer} from '../../actions/Multiplayer'


const mapStateToProps = (state: AppState, ownProps: ToolsStateProps): ToolsStateProps => {
  return {
    settings: state.settings,
    user: state.user,
  };
}

export const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): ToolsDispatchProps => {
  return {
    onCustomCombatSelect(settings: SettingsType): void {
      dispatch(initCustomCombat({}));
    },
    onQuestCreatorSelect(): void {
      openWindow(URLS.questCreator);
    },
    onPrivateQuestsSelect(settings: SettingsType, user: UserState): void {
      const privateSearch = (u: UserState) => {
        dispatch(search({
          search: {
            owner: u.id,
            partition: 'expedition-private',
            order: '-published',
          },
          settings: {
            ...settings,
            contentSets: {
              horror: true,
            },
          }
        }));
      };

      if (!user || user.id === '') {
        dispatch(login({callback: privateSearch}));
      } else {
        privateSearch(user);
      }
    },
    onMultiplayerSelect(user: UserState): void {
      if (user && user.loggedIn) {
        dispatch(loadMultiplayer(user));
      } else {
        dispatch(login({callback: (user: UserState)=> {
          dispatch(loadMultiplayer(user));
        }}));
      }
    },
    testMusic(): void {
      const intensity = Number(prompt(`Enter intensity (0-${MUSIC_INTENSITY_MAX})`));
      if (intensity) {
        dispatch(audioSetIntensity(intensity));
      }
    },
    testMusicRandom(): void {
      const getRandomIntInclusive = function(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
      }
      const intensity = getRandomIntInclusive(0, MUSIC_INTENSITY_MAX);
      dispatch(openSnackbar('Setting intensity to ' + intensity));
      dispatch(audioSetIntensity(intensity));
    },
    testMusicStop(): void {
      dispatch(audioSetIntensity(0));
    },
    testSfx(): void {
      dispatch(audioPlaySfx('combat_defeat'));
    },
  };
}

const ToolsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Tools);

export default ToolsContainer
