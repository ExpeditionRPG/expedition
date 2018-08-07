export const NUMBER = 422;
export const NAME = `Invalid skill check: "text"`;
export const DESCRIPTION = `Skill checks must be of the form: <light/dark> <athletics/knowledge/charisma> <success/failure/retry/interrupted>. Only the middle value is strictly required.`;

export const INVALID = [
`_decision_

* on light athletics

  Something happens!

* on dark charisma

  Something happens!

* on knowledge

  Something happens!

* on failure

  Something happens!

* on text

  Something happens!`,
];

export const VALID = [
`_decision_

* on light athletics

  Something happens!

* on dark charisma

  Something happens!

* on knowledge

  Something happens!

* on failure

  Something happens!`,
];
