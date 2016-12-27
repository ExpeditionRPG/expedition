export const NAME = `<key> should be a number, but is <type>`;
export const METADATA_ERROR = true;
export const DESCRIPTION = `The quest metadata key you're trying to use must be a number.`;

export const INVALID = [
`# Test Quest
summary: A quest that'll test ya
author: Test McTesterson
minplayers: text
maxplayers: 6
mintimeminutes: 1
maxtimeminutes: 10`
];

export const INVALID_ERRORS = [
`minplayers should be a number, but is string`
];

export const VALID = [
`# Test Quest
summary: A quest that'll test ya
author: Test McTesterson
minplayers: 1
maxplayers: 6
mintimeminutes: 1
maxtimeminutes: 10`
];
