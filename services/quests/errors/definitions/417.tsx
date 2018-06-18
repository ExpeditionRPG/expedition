export const NUMBER = 417;
export const NAME = `Combat card must have '<on win/on lose>' event`;
export const DESCRIPTION = ``;

export const INVALID = [
`_combat_

- Skeleton Swordsman

* on win

  Card`,
`_combat_

- Skeleton Swordsman

* on lose

  Card`
];

export const INVALID_ERRORS = [
`combat card must have "on lose" event`,
`combat card must have "on win" event`
];

export const VALID = [
`_combat_

- Skeleton Swordsman

* on win

  Card

* on lose

  Card`
];
