export const NUMBER = 432;
export const NAME = `Detected a state where this card has 0 active choices`;
export const DESCRIPTION = `Some path to this card results in no defined choices.`;

export const INVALID = [
`_A card_

* {{false}} A single disabled choice

  **end**`
];

export const VALID = [
`_A card_

* A single enabled choice

  **end**`,
`_A card_

_Another card_

**end**`
];
