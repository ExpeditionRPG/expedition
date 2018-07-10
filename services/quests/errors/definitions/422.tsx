export const NUMBER = 422;
export const NAME = `Invalid skill check: "text"`;
export const DESCRIPTION = `Skill checks must be of the form: <light/dark> <athletics/knowledge/charisma> <success/failure/retry/interrupted>. Only the middle value is strictly required.`;

export const INVALID = [
`_decision_

* light athletics

  Something happens!

* dark charisma

  Something happens!

* knowledge

  Something happens!

* failure

  Something happens!

* text

  Something happens!`,
];

export const VALID = [
`_decision_

* light athletics

  Something happens!

* dark charisma

  Something happens!

* knowledge

  Something happens!

* failure

  Something happens!`,
];
