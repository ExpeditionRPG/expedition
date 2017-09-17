import Redux from 'redux'
import {connect} from 'react-redux'
import Tools, {ToolsStateProps, ToolsDispatchProps} from './Tools'
import {AppState, SettingsType, UserState} from '../reducers/StateTypes'
import {initCustomCombat} from '../cardtemplates/combat/Actions'
import {URLS} from '../Constants'
import {toCard} from '../actions/Card'
import {search} from '../actions/Web'
import {login} from '../actions/User'
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
      dispatch(initCustomCombat(settings));
    },
    onQuestCreatorSelect(): void {
      window.open(URLS.questCreator, '_system');
    },
    onPrivateQuestsSelect(user: UserState): void {
      const privateSearch = (u: UserState) => {
        dispatch(search({owner: u.id, partition: 'expedition-private'}));
      };

      if (!user) {
        dispatch(login(privateSearch));
      } else {
        privateSearch(user);
      }
    },
    onRemotePlaySelect(user: UserState): void {
      dispatch(loadRemotePlay(user));
    }
  };
}

const ToolsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Tools);

export default ToolsContainer
