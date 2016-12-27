export const NAME = `could not parse trigger`;
export const DESCRIPTION = `This happens when the QDL parser thinks a trigger is malformed.`;

export const INVALID = [
`**end`,
`**goto`
];

export const VALID = [
`**end**`,
`**goto id**`,
`**{{cond}} goto id**`
];
