/// <reference path="../typings/expect/expect.d.ts" />
/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <reference path="../typings/custom/require.d.ts" />

import {LiveParser, debugRender} from './parser'
import {XMLRender} from './xmlparser'

var prettifyHTML = (require("html") as any).prettyPrint;

var basictest = `#Quest Title
testparam: hi

_Roleplay Card_

Stuff

And a line

_Another Card_

More stuff

* Decision

  _combat_ {"enemies": ["Skeleton Swordsman"]}

  * on win

    Victory!

    _end_

  * on lose

    Defeat!

    _end_

* Another decision
  that is multiple lines long

  More stuff

  _end_

* Still another decision!

  And a thing.

  _end_`;

describe('parser', () => {
  /*
  it('Throws reasonable error on no input', () => {
    var parser = new LiveParser(debugRender);
    parser.update('');
    console.log(parser.getRender());
  });
  it('Handles diffing from empty file', () => {
    var parser = new LiveParser(debugRender);
    parser.update('');
    parser.update('#Test Quest');
    console.log(parser.getRender());
  });
  it('Parses basic QDL', () => {
    var parser = new LiveParser(debugRender);
    parser.update(basictest);
    console.log(parser.getRender());
  });
  */
  it('Handles wiping out intermediate block');
  it('Parses basic QDL to XML', () => {
    var parser = new LiveParser(XMLRender);
    parser.update(basictest);
    console.log("OUT:");
    console.log(prettifyHTML(''+parser.getRender()));
  })
});