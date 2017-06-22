export const NAME = `Detected a state where this card has # "win" and # "lose" events; want 1 and 1`;
export const DESCRIPTION = `Some path to this combat card results in an incorrect number of win and lose events. There must be exactly one of each.`;

export const INVALID = [
`_A card_

{{useExtraEvent = true}}

_combat_

- Giant Rat

* on win

  **end**

* {{useExtraEvent}} on win

  **end**

* on lose

  **end**`
];

export const VALID = [
`_A card_

{{useExtraEvent = true}}

_combat_

- Giant Rat

* {{!useExtraEvent}} on win

  **end**

* {{useExtraEvent}} on win

  **end**

* on lose

  **end**`];
