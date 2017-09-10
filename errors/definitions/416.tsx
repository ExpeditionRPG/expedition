export const NUMBER = 416;
export const NAME = `lines within combat block must be events or enemies, not freestanding text`;
export const DESCRIPTION = ``;

export const INVALID = [
`_combat_

- Skeleton Swordsman

some random text

* on win

  Card

* on lose

  Card`
];

export const VALID = [
`_combat_

- Skeleton Swordsman

* on win

  Card

* on lose

  Card`
];
