import { connect } from 'react-redux'
import {QuestDetails} from '../reducers/QuestTypes'
import {AppState, SettingsType} from '../reducers/StateTypes'
import {toCard} from '../actions/card'
import {initCombat} from '../actions/quest'
import AdvancedPlay, {AdvancedPlayStateProps, AdvancedPlayDispatchProps} from './AdvancedPlay'

const mapStateToProps = (state: AppState, ownProps: AdvancedPlayStateProps): AdvancedPlayStateProps => {
  return {
    settings: state.settings,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): AdvancedPlayDispatchProps => {
  return {
    onSearchSelect(): void {
      dispatch(toCard('SEARCH_CARD', 'DISCLAIMER'));
    },
    onCustomCombatSelect(settings: SettingsType): void {
      dispatch(toCard('CUSTOM_COMBAT', 'DRAW_ENEMIES'));
      dispatch(initCombat(null, settings));
    },
  };
}

const AdvancedPlayContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AdvancedPlay);

export default AdvancedPlayContainer