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
    numLocalPlayers: 3,
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
        numLocalPlayers: 3,
        aliveAdventurers: 3,
        type: 'STATUS',
      },
      2: {
        connected: true,
        numLocalPlayers: 2,
        aliveAdventurers: 2,
        type: 'STATUS',
      },
    },
  },
  s2p2a1: {
    ...initialMultiplayer,
    clientStatus: {
      1: {
        connected: true,
        numLocalPlayers: 1,
        aliveAdventurers: 0,
        type: 'STATUS',
      },
      2: {
        connected: true,
        numLocalPlayers: 1,
        aliveAdventurers: 1,
        type: 'STATUS',
      },
    },
  },
};
