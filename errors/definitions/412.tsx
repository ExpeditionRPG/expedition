export const NUMBER = 412;
export const NAME = `Failed to parse bulleted line (check your JSON)`;
export const DESCRIPTION = `Bulleted lines (such as combat events) can have JSON after them.
In this case, the compiler found a JSON-like string and failed to parse it.`;

// TODO fixme; seems broken on the QDL level
export const INVALID = [
// `_combat_

// - Skeleton Swordsman

// * on win {invalid_json}

//   text

// * on lose

//   text`
] as any[];

export const VALID = [
`_combat_

- Skeleton Swordsman

* on win {"loot": false, "heal": 2}

  text

* on lose

  text`
];
