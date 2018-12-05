export const NUMBER = 427;
export const NAME = `Invalid transition from this combat to another combat`;
export const DESCRIPTION = `Jumping between combat cards is not supported.`;
export const TEST_WITH_CRAWLER = true;

export const INVALID = [
`_combat_

- Giant Rat

* on round

  Here's another combat!

  _combat_

  - Giant Rat

  * on win

    Card

  * on lose

    Card

* on win

  Card

* on lose

  Card`,
`_combat_

- Giant Rat

* on round

  This is a round

  **goto c2**

* on win

  Card

* on lose

  Card

_combat_

- Giant Rat

* on round

  _Round_ (#c2)

  This is a round in a different combat

* on win

  Card

* on lose

  Card`,
];

export const VALID = [
`_combat_

- Giant Rat

* on round

  Let's finish this combat.

* on win

  Card

* on lose

  Card

_Next combat_

Here's another combat!

_combat_

- Giant Rat

* on win

  Card

* on lose

  Card`,
`_combat_

- Giant Rat

* on round

  This is a round. It triggers win, so users can wrap up combat.

  **win**

* on win

  This happens first

* on lose

  Card

_combat_

- Giant Rat

* on round

  Users get here by entering the combat card first.

* on win

  Card

* on lose

  Card`,
];
