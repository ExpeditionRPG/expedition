import { connect } from 'react-redux'
import {AppState} from '../reducers/StateTypes'
import {changeSetting} from '../actions/settings'
import {toCard} from '../actions/card'
import SplashScreen, {SplashScreenStateProps, SplashScreenDispatchProps} from './SplashScreen'

const mapStateToProps = (state: AppState, ownProps: any): SplashScreenStateProps => {
  return {};
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): SplashScreenDispatchProps => {
  return {
    onPlayerCountSelect: (numPlayers: number) => {
      dispatch(changeSetting('numPlayers', numPlayers));
      dispatch(toCard('FEATURED_QUESTS'));
    }
  };
}

const SplashScreenContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SplashScreen);

export default SplashScreenContainer