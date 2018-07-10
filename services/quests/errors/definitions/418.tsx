export const NUMBER = 418;
export const NAME = `Enemy tier must be a positive number`;
export const DESCRIPTION = `A tier was specified that was either not a number, or not within the range of valid tiers.`;

export const INVALID = [
`_combat_

- Enemy {"tier": "three"}
- Enemy {"tier": 1}

* on win

  text

* on lose

  text`,
];

export const VALID = [
`_combat_

- Enemy {"tier": 3}
- Enemy {"tier": 1}

* on win

  text

* on lose

  text`,
];
