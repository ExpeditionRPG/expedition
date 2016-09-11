/// <reference path="../../typings/expect/expect.d.ts" />
/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../typings/custom/require.d.ts" />

var expect: any = require('expect')
import {SET_DIALOG} from './ActionTypes'
import {setDialog} from './dialog'

describe('setDialog', () => {
  it('creates action', () => {
    expect(setDialog('USER', true)
    ).toEqual({
      type: SET_DIALOG,
      dialog: 'USER',
      shown: true
    })
  })
})