import Redux from 'redux'
import {connect} from 'react-redux'

import {logEvent} from '../../Main'
import {setDialog} from '../../actions/Dialog'
import {changeSettings} from '../../actions/Settings'
import {AppState, DifficultyType, FontSizeType} from '../../reducers/StateTypes'
import Settings, {SettingsStateProps, SettingsDispatchProps, fontSizeValues, timerValues} from './Settings'

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
    onAudioChange: (v: boolean) => {
      dispatch(changeSettings({audioEnabled: v}));
    },
    onAutoRollChange: (v: boolean) => {
      dispatch(changeSettings({autoRoll: v}));
    },
    onExpansionSelect: () => {
      dispatch(setDialog('EXPANSION_SELECT'));
    },
    onExperimentalChange: (v: boolean) => {
      logEvent('experimental_settings_changed_to', {label: v.toString()});
      dispatch(changeSettings({experimental: v}));
    },
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
    onFontSizeDelta: (idx: number, delta: number) => {
      let i = idx + delta;
      if (i >= fontSizeValues.length) {
        i = 0;
      } else if (i < 0) {
        i = fontSizeValues.length - 1;
      }
      dispatch(changeSettings({fontSize: fontSizeValues[i]}));
    },
    onTimerSecondsDelta: (idx: number, delta: number) => {
      let i = idx + delta;
      if (i >= timerValues.length) {
        i = 0;
      } else if (i < 0) {
        i = timerValues.length - 1;
      }
      dispatch(changeSettings({timerSeconds: timerValues[i]}));
    },
  };
}

const SettingsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);

export default SettingsContainer
