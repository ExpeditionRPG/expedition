export const NUMBER = 430;
export const NAME = `An action on this card leads nowhere (invalid goto id or no **end**)`;
export const DESCRIPTION = `Your card has no next choice, nor does it end the quest.`;
export const TEST_WITH_CRAWLER = true;

export const INVALID = [
`_roleplay card_

with some text!

<end of file>`
];

export const VALID = [
`_roleplay card_

with some text!

**end**

<end of file>`
];
