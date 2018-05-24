import Redux from 'redux'
import {connect} from 'react-redux'
import Tools, {ToolsStateProps, ToolsDispatchProps} from './Tools'
import {AppState, SettingsType, UserState} from '../../reducers/StateTypes'
import {initCustomCombat} from '../../components/views/quest/cardtemplates/combat/Actions'
import {audioSetIntensity} from '../../actions/Audio'
import {search} from '../../actions/Search'
import {login} from '../../actions/User'
import {URLS, MUSIC_INTENSITY_MAX} from '../../Constants'
import {openWindow} from '../../Globals'
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
      openWindow(URLS.QUEST_CREATOR);
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
  };
}

const ToolsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Tools);

export default ToolsContainer
