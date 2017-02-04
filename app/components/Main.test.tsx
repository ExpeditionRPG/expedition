/// <reference path="../../typings/expect/expect.d.ts" />
/// <reference path="../../typings/jasmine/jasmine.d.ts" />

import expect from 'expect'
import ContextEditor from './ContextEditor'

describe('Main', () => {
  it('Displays splash screen when not logged in');
  it('Displays bottom drawer when bottomPanelShown');
  it('Hides bottom drawer when not bottomPanelShown');
  it('Toggles panel shown when panel fold button clicked');
}