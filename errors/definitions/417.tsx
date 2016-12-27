export const NAME = `combat block must have '<on win/on lose>' event`;
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
`combat block must have 'on lose' event`,
`combat block must have 'on win' event`
];

export const VALID = [
`_combat_

- Skeleton Swordsman

* on win

  Card

* on lose

  Card`
];
