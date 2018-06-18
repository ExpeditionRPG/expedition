export const NUMBER = 436;
export const NAME = `Incorrect indentation: leading spaces must be multiple of two.`;
export const DESCRIPTION = `Make sure that its indentation matches with the lines before or after it.
  If you aren't sure what the corrent inedentation should be, see the documentation / help for more details.`;

export const TEST_WITH_CRAWLER = true;

export const INVALID = [
`* choice

   text with three leading spaces`
];

export const VALID = [
`* choice

  text with two leading spaces`
];
