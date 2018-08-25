import {connect} from 'react-redux';
import Redux from 'redux';
import {setDialog} from '../../actions/Dialog';
import {changeSettings} from '../../actions/Settings';
import {logEvent} from '../../Logging';
import {AppState, DifficultyType} from '../../reducers/StateTypes';
import Settings, {DispatchProps, fontSizeValues, StateProps, timerValues} from './Settings';

const mapStateToProps = (state: AppState): StateProps => {
  return state.settings;
};

/* tslint:disable */
const difficultyAdd: any = {
  EASY: 'NORMAL',
  NORMAL: 'HARD',
  HARD: 'IMPOSSIBLE',
  IMPOSSIBLE: 'EASY',
};

const difficultySub: any = {
  EASY: 'IMPOSSIBLE',
  NORMAL: 'EASY',
  HARD: 'NORMAL',
  IMPOSSIBLE: 'HARD',
};
/* tslint:enable */

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onAudioChange: (v: boolean) => {
      dispatch(changeSettings({audioEnabled: v}));
    },
    onAutoRollChange: (v: boolean) => {
      dispatch(changeSettings({autoRoll: v}));
    },
    onDifficultyDelta: (difficulty: DifficultyType, i: number) => {
      if (i > 0) {
        difficulty = difficultyAdd[difficulty];
      } else {
        difficulty = difficultySub[difficulty];
      }
      dispatch(changeSettings({difficulty}));
    },
    onExpansionSelect: () => {
      dispatch(setDialog('EXPANSION_SELECT'));
    },
    onExperimentalChange: (v: boolean) => {
      logEvent('settings', 'experimental_settings_changed_to', {label: v.toString()});
      dispatch(changeSettings({experimental: v}));
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
    onMultitouchChange: (v: boolean) => {
      dispatch(changeSettings({multitouch: v}));
    },
    onPlayerDelta: (numPlayers: number, delta: number) => {
      numPlayers += delta;
      if (numPlayers <= 0 || numPlayers > 6) {
        return;
      }
      dispatch(changeSettings({numPlayers}));
    },
    onShowHelpChange: (v: boolean) => {
      dispatch(changeSettings({showHelp: v}));
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
    onVibrationChange: (v: boolean) => {
      dispatch(changeSettings({vibration: v}));
    },
  };
};

const SettingsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);

export default SettingsContainer;
