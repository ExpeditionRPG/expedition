import Redux from 'redux'
import {connect} from 'react-redux'
import AdvancedPlay, {AdvancedPlayStateProps, AdvancedPlayDispatchProps} from './AdvancedPlay'
import {toCard} from '../actions/card'
import {initCombat} from '../actions/quest'
import {fetchQuestXML} from '../actions/web'
import {AppState, SettingsType} from '../reducers/StateTypes'


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
