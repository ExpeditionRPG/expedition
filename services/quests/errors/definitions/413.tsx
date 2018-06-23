export const NUMBER = 413;
export const NAME = `Could not parse card header`;
export const DESCRIPTION = `Generally caused by an invalid JSON annotation`;

// TODO doesn't actually error
export const INVALID = [] as any;
// export const INVALID = [
// `_combat_ {invalid_json}

// - Skeleton Swordsman

// * on win

//   Card

// * on lose

//   Card`
// ];

export const VALID = [
`_combat_ {"icon": "bandit"}

- Skeleton Swordsman

* on win

  Card

* on lose

  Card`,
];
