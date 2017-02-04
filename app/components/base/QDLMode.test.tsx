import expect from 'expect'
import { QDLMode } from './QDLMode'

// TODO breaks on use; window is not defined when accessed by brace
// Known issue with brace - not meant to be run outside of a browser: https://github.com/thlorenz/brace/issues/40
// One option would be to split out the line-parsing logic from the brace / UI file entirely,
// since just importing a file that imports brace is enough to break it
// (of course, won't be that simple, will also have to mock several parts of session object)

describe('QDL Mode', () => {

  // console.log(QDLMode);

  it('correctly identifies rows to show the fold widget on');

  it('correctly identifies the start and end row of an expansion');
})
