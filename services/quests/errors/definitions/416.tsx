export const NUMBER = 416;
export const NAME = `Lines within combat card must be events or enemies, not freestanding text`;
export const DESCRIPTION = ``;

// TODO fixme; need to check if line is bulleted in QDL before trying to .extractBulleted
export const INVALID = [
/*`_combat_

- Skeleton Swordsman

* on win

  Card

* on lose

  Card

some random text`*/
];

export const VALID = [
`_combat_

- Skeleton Swordsman

* on win

  Card

* on lose

  Card`,
];
