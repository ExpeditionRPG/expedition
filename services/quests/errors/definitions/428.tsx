export const NUMBER = 428;
export const NAME = `choice/event missing title`;
export const DESCRIPTION = `All choices need titles, which is used as the label for adventurers to click on.`;

export const INVALID = [
`_Card_

* {{visible==true}}`,
// TODO create another test case with `* ` - but, Sublime Text with auto whitespace trim automatically removes
// the extra space, breaking the test
// OR make it so that choices are matched even without at least one space after the *...
];

export const VALID = [
`_Card_

* {{visible==true}} Click me`,
`_Card_

* Click me`,
];
