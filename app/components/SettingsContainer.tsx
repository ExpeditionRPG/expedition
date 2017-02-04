import { connect } from 'react-redux'
import {AppState} from '../reducers/StateTypes'
import {changeSettings} from '../actions/settings'
import Settings, {SettingsStateProps, SettingsDispatchProps} from './Settings'
import {DifficultyType} from '../reducers/QuestTypes'

const mapStateToProps = (state: AppState, ownProps: SettingsStateProps): SettingsStateProps => {
  return state.settings;
}

const difficultyAdd: any = {
  EASY: 'NORMAL',
  NORMAL: 'HARD',
  HARD: 'IMPOSSIBLE',
  IMPOSSIBLE: 'EASY',
}

const difficultySub: any = {
  EASY: 'IMPOSSIBLE',
  NORMAL: 'EASY',
  HARD: 'NORMAL',
  IMPOSSIBLE: 'HARD',
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): SettingsDispatchProps => {
  return {
    onShowHelpChange: (v: boolean) => {
      dispatch(changeSettings({showHelp: v}));
    },
    onMultitouchChange: (v: boolean) => {
      dispatch(changeSettings({multitouch: v}));
    },
    onVibrationChange: (v: boolean) => {
      dispatch(changeSettings({vibration: v}));
    },
    onPlayerDelta: (numPlayers: number, delta: number) => {
      numPlayers += delta;
      if (numPlayers <= 0 || numPlayers > 6) {
        return;
      }
      dispatch(changeSettings({numPlayers}));
    },
    onDifficultyDelta: (difficulty: DifficultyType, i: number) => {
      if (i > 0) {
        difficulty = difficultyAdd[difficulty];
      } else {
        difficulty = difficultySub[difficulty];
      }
      dispatch(changeSettings({difficulty}));
    },
  };
}

const SettingsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);

export default SettingsContainer
