export const NUMBER = 419;
export const NAME = `Detected a non-standard enemy without explicit tier JSON`;
export const DESCRIPTION = `An enemy was listed that is not part of the standard deck of enemies, without a tier specified.
This may be a spelling/capitalization error.`;

export const INVALID = [
`_combat_

- Custom Enemy

...`,
];

export const VALID = [
`_combat_

- Custom Enemy {"tier": 3}

...`
];
