export const NAME = `failed to parse bulleted line (check your JSON)`;
export const DESCRIPTION = `Bulleted lines (such as combat events) often have JSON strings after them.
In this case, the compiler found a JSON-like string and failed to parse it`;

export const INVALID = [
`_Combat_

- enemy

* on win {"Loot": false; "heal": 2}

  _end_

* on lose

  _end_`
];

export const VALID = [
`_Combat_

- enemy

* on win {"Loot": false, "heal": 2}

  _end_

* on lose

  _end_`
];
