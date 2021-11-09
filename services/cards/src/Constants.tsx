export const MAX_COUNTER_HEALTH = 30;
export const MAX_ADVENTURER_HEALTH = 12;
export const POKER_CARDS_PER_LETTER_PAGE = 9;

export interface CardSource {
  name: string;
  key: string;
  sheets: {[key: string]: string};
}

export const SHEETS: CardSource[] = [
  {
    name: 'Expedition',
    key: '2PACX-1vQ0Hx1RcDqkc3pn7ZyKEiqdDXm4miEgDeozJ9amJrxz2QzAH8AOaf6rqaLJL4G3fcqCDIYDKdDqsuax',
    sheets: {
      Translations: '2111992856',
      Helper: '987926921',
      Adventurer: '558719643',
      Ability: '0',
      Encounter: '1555320979',
      Loot: '1510752952',
    },
  },
  {
    name: 'The Horror',
    key: '2PACX-1vTYzRwsE32Dh6U_3Xn56-SEfF6SadUjU6rTdEroX6GgrdAAt7Ptzn1RyB-2H0UIR0pOoTbySxrqSnSu',
    sheets: {
      Ability: '2087688178',
      Adventurer: '2140283349',
      Encounter: '1555320979',
      Loot: '756185894',
      Persona: '1235118672',
    },
  },
  {
    name: 'The Future',
    key: '2PACX-1vQcPWt9MO7ZDtLaR1teWcuNxoRHH4Q1Yf4xLpyv3xSEqSOLbpPVj_aB5Emh7sOnZ3hMIwvA9LJn76pZ',
    sheets: {
      Adventurer: '558719643',
      Ability: '0',
      Encounter: '1555320979',
      Loot: '1510752952',
      Skill: '1013479922',
    },
  },
  {
    name: 'Of Wyrms And Giants',
    key: '2PACX-1vTpLs-jQwdK-WaOWFFqAOqrTYeMFk3j116-mLso3tmrq5PKD6jJNyIxAvs28FQiJ8VD0fk5e9ZN-7FN',
    sheets: {
      Encounter: '1555320979',
    },
  },
  {
    name: 'Scarred Lands',
    key: '2PACX-1vQ-jU0FGl9PGXm0m-jYJazhxYjLhpSwdPFNCVAGXTM6XrdcZ65MXRBtWdIJvWLglC4tFmUB_y324UMb',
    sheets: {
      Adventurer: '558719643',
      Ability: '0',
      Encounter: '1555320979',
      Loot: '1510752952',
    },
  },
];
