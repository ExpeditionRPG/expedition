import { connect } from 'react-redux'
import {AppState} from '../reducers/StateTypes'
import {changeSetting} from '../actions/settings'
import {toFeaturedQuests} from '../actions/card'
import SplashScreen, {SplashScreenStateProps, SplashScreenDispatchProps} from './SplashScreen'

const mapStateToProps = (state: AppState, ownProps: any): SplashScreenStateProps => {
  return {};
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): SplashScreenDispatchProps => {
  return {
    onPlayerCountSelect: (numPlayers: number) => {
      dispatch(changeSetting('numPlayers', numPlayers));
      dispatch(toFeaturedQuests());
    }
  };
}

const SplashScreenContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SplashScreen);

export default SplashScreenContainer