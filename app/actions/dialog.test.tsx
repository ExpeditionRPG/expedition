import expect from 'expect'
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