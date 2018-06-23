export const NUMBER = 435;
export const NAME = `[art] should be on its own line.`;
export const DESCRIPTION = `Or, you can change it to :icon: for a smaller icon that's inline with the text.`;

export const TEST_WITH_CRAWLER = true;

export const INVALID = [
`_A card_

Text [art]`,
`_A card_

> Instruction [art]`,
`_A card_

* Choice [art]

  Text`,
];

export const VALID = [
`_A card_

Text

[art]`,
`_A card_

> Instruction :icon:`,
`_A card_

* Choice :icon:

  Text`,
];
