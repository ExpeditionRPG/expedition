export const NAME = `Health/Ability/Loot-affecting instructions should follow the format...`;
export const DESCRIPTION = `Instructions that modify a player's health, ability, and/or loot should follow a standard format.`;

export const TEST_WITH_CRAWLER = true;

export const INVALID = [
`_A card_

> You get a loot!

**end**`,
`_A card_

> Heal 5 hp.
**end**`
];

export const VALID = [
`_A card_

> Draw 1 Tier I loot.

**end**`,
`_A card_

> Your party discards 1 loot.

**end**`,
`_A card_

> You may learn 1 ability

**end**`,
`_A card_

> Discard 2 abilities

**end**`,
`_A card_

> Gain 5 Health.

**end**`,
];
