import Redux from 'redux'
import {connect} from 'react-redux'
import Tools, {ToolsStateProps, ToolsDispatchProps} from './Tools'
import {AppState, SettingsType} from '../reducers/StateTypes'
import {initCustomCombat} from '../cardtemplates/combat/Actions'
import {URLS} from '../Constants'

declare var window:any;

const mapStateToProps = (state: AppState, ownProps: ToolsStateProps): ToolsStateProps => {
  return {
    settings: state.settings,
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
  };
}

const ToolsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Tools);

export default ToolsContainer
