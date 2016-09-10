import expect from 'expect'
import {editor} from './editor'
import {setCodeView} from '../actions/editor'
import {xml_filler} from '../buffer'

describe('editor', () => {
  it('returns initial state', () => {
    expect(
      editor(undefined, {})
    ).toEqual({xml: xml_filler, view: 'XML'});
  })

  it('stores XML and switch to markdown view', () => {
    var cb_called = false;
    expect(editor(
      {xml: "", view: 'XML'},
      setCodeView('XML', xml_filler, 'MARKDOWN', () => {cb_called = true})
    )).toEqual({
      xml: xml_filler,
      view: 'MARKDOWN'
    });
    expect(cb_called).toBe(true);
  })

  it('stores converted XML and switch to XML view')

  it('saves loaded quest data')

  it('resets on new quest')

  it('resets on quest deletion')

  it('triggers quest download')
})