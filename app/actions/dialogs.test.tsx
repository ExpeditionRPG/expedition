/// <reference path="../../typings/expect/expect.d.ts" />
/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../typings/custom/require.d.ts" />

var expect: any = require('expect')
import {SetDialogAction} from './ActionTypes'
import {setDialog} from './dialogs'

describe('setDialog', () => {
  it('creates action', () => {
    expect(setDialog('ERROR', true)
    ).toEqual({
      type: 'SET_DIALOG',
      dialog: 'ERROR',
      shown: true
    } as SetDialogAction)
  })
})