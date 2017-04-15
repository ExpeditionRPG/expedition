import Redux from 'redux'
import { connect } from 'react-redux'
import {AppState, XMLElement} from '../reducers/StateTypes'
import {changeSettings} from '../actions/Settings'
import {toPrevious, toCard} from '../actions/Card'
import PlayerCountSetting, {PlayerCountSettingStateProps, PlayerCountSettingDispatchProps} from './PlayerCountSetting'

const mapStateToProps = (state: AppState, ownProps: PlayerCountSettingStateProps): PlayerCountSettingStateProps => {
  return {
    numPlayers: state.settings.numPlayers
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): PlayerCountSettingDispatchProps => {
  return {
    onNext: () => {
      dispatch(changeSettings({multitouch: false}));
      dispatch(toCard('FEATURED_QUESTS'));
    },
    onDelta: (numPlayers: number, delta: number) => {
      numPlayers += delta;
      if (numPlayers <= 0 || numPlayers > 6) {
        return;
      }
      dispatch(changeSettings({numPlayers}));
    },
  };
}

const PlayerCountSettingContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PlayerCountSetting);

export default PlayerCountSettingContainer
