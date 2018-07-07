export const NUMBER = 420;
export const NAME = `Need whitespace between list and next section`;
export const DESCRIPTION = `Your quest has no whitespace between a parameter list and a following section.`;
export const TEST_WITH_CRAWLER = true;

export const INVALID = [
`_combat_

- Giant Rat
* on win

  text

* on lose

  text`,
];

export const VALID = [
`_combat_

- Giant Rat

* on win

  text

* on lose

  text`,
];
