export const NUMBER = 435;
export const NAME = `Use :icon: instead of [icon]`;
export const DESCRIPTION = `Using brackets for icons has been depricated to make way for more features! Icons should now be surrounded by colons.`;

export const TEST_WITH_CRAWLER = true;


export const INVALID = [
`_A card_

Text [icon]`,
`_A card_

> Instruction [icon]`,
`_A card_

* Choice [icon]

  Text`
];

export const VALID = [
`_A card_

Text :icon:`,
`_A card_

> Instruction :icon:`,
`_A card_

* Choice :icon:

  Text`,
];
