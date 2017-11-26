import Redux from 'redux'
import {connect} from 'react-redux'
import Tools, {ToolsStateProps, ToolsDispatchProps} from './Tools'
import {AppState, SettingsType, UserState} from '../reducers/StateTypes'
import {initCustomCombat} from '../cardtemplates/combat/Actions'
import {audioSetIntensity, audioPlaySfx} from '../actions/Audio'
import {toCard} from '../actions/Card'
import {search} from '../actions/Search'
import {openSnackbar} from '../actions/Snackbar'
import {login} from '../actions/User'
import {URLS} from '../Constants'
import {getStore} from '../Store'
import {loadRemotePlay} from '../actions/RemotePlay'

declare var window:any;

const mapStateToProps = (state: AppState, ownProps: ToolsStateProps): ToolsStateProps => {
  return {
    settings: state.settings,
    user: state.user,
  };
}

export const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): ToolsDispatchProps => {
  return {
    onCustomCombatSelect(settings: SettingsType): void {
      dispatch(initCustomCombat({settings}));
    },
    onQuestCreatorSelect(): void {
      window.open(URLS.questCreator, '_system');
    },
    onPrivateQuestsSelect(user: UserState): void {
      const privateSearch = (u: UserState) => {
        dispatch(search({owner: u.id,
          partition: 'expedition-private',
          expansions: ['horror'],
          order: '-published',
        }));
      };

      if (!user || user.id === '') {
        dispatch(login({callback: privateSearch}));
      } else {
        privateSearch(user);
      }
    },
    onRemotePlaySelect(user: UserState): void {
      if (user && user.loggedIn) {
        dispatch(loadRemotePlay(user));
      } else {
        dispatch(login({callback: (user: UserState)=> {
          dispatch(loadRemotePlay(user));
        }}));
      }
    },
    testMusic(): void {
      const intensity = Number(prompt('Enter intensity (0-8)'));
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
      const intensity = getRandomIntInclusive(0, 8);
      dispatch(openSnackbar('Setting intensity to ' + intensity));
      dispatch(audioSetIntensity(intensity));
    },
    testMusicStop(): void {
      dispatch(audioSetIntensity(0));
    },
    testSfx(): void {
      dispatch(audioPlaySfx('sfx_combat_defeat'));
    },
  };
}

const ToolsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Tools);

export default ToolsContainer
