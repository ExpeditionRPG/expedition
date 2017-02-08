import {connect} from 'react-redux'
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
    onCustomCombatSelect(settings: SettingsType): void {
      dispatch(toCard('CUSTOM_COMBAT', 'DRAW_ENEMIES'));
      dispatch(initCombat(null, settings, {
        type: 'Combat',
        icon: null,
        enemies: [],
        ctx: {scope: {}},
      }));
    },
  };
}

const AdvancedPlayContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AdvancedPlay);

export default AdvancedPlayContainer
