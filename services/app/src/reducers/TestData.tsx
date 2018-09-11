import {initialMultiplayer} from './Multiplayer';
import {DifficultyType, FontSizeType, MultiplayerState, SettingsType} from './StateTypes';

export const Settings: {[k: string]: SettingsType} = {
  basic: {
    audioEnabled: false,
    autoRoll: false,
    contentSets: {
      horror: false,
    },
    difficulty: 'NORMAL' as DifficultyType,
    experimental: false,
    fontSize: 'NORMAL' as FontSizeType,
    multitouch: true,
    numPlayers: 3,
    showHelp: true,
    simulator: false,
    timerSeconds: 10,
    vibration: true,
  },
};

export const Multiplayer: {[k: string]: MultiplayerState} = {
  basic: {...initialMultiplayer},
  s2p5: {
    ...initialMultiplayer,
    clientStatus: {
      1: {
        connected: true,
        numPlayers: 3,
        type: 'STATUS',
      },
      2: {
        connected: true,
        numPlayers: 2,
        type: 'STATUS',
      },
    },
  },
};
