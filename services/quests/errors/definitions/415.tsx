export const NUMBER = 415;
export const NAME = `trigger found with indented section - check your starting whitespace`;
export const DESCRIPTION = ``;

export const INVALID = [
`_title_

**goto somewhere**

  Extra text indented below the trigger

_another title_ (#somewhere)

More text
`,
];

export const VALID = [
`_title_

**goto somewhere**

_another title_ (#somewhere)

More text
`,
];
