export const NAME = `Tier must be a number between 1 and 9, inclusive`;
export const DESCRIPTION = `A tier was specified that was either not a number, or not within the range of valid tiers.`;

export const INVALID = [
`_combat_

- Enemy {"tier": "hello"}

...`,
`_combat_

- Enemy {"tier": 10}

...`
];

export const VALID = [
`_combat_

- Enemy {"tier": 3}

...`
];
