import Redux from 'redux'
import {connect} from 'react-redux'
import AdvancedPlay, {AdvancedPlayStateProps, AdvancedPlayDispatchProps} from './AdvancedPlay'
import {AppState, SettingsType} from '../reducers/StateTypes'
import {initCustomCombat} from '../cardtemplates/combat/Actions'


const mapStateToProps = (state: AppState, ownProps: AdvancedPlayStateProps): AdvancedPlayStateProps => {
  return {
    settings: state.settings,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): AdvancedPlayDispatchProps => {
  return {
    onCustomCombatSelect(settings: SettingsType): void {
      dispatch(initCustomCombat(settings));
    },
  };
}

const AdvancedPlayContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AdvancedPlay);

export default AdvancedPlayContainer
