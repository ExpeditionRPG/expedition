import {configure, shallow} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
configure({ adapter: new Adapter() });
import {initialMultiplayer} from 'app/reducers/Multiplayer';
import {initialSettings} from 'app/reducers/Settings';
import {defaultContext} from '../Template';
import {ParserNode} from '../TemplateTypes';
import PrepareDecision, {Props} from './PrepareDecision';

const cheerio: any = require('cheerio');
const TEST_NODE = new ParserNode(cheerio.load(`
  <decision>
    <p>prelude text</p>
    <event on="athletics success"></event>
    <event on="athletics failure"></event>
  </decision>`)('decision'), defaultContext());

function setup(overrides: Partial<Props>) {
  const props: Props = {
    theme: 'light',
    settings: initialSettings,
    node: TEST_NODE.clone(),
    multiplayerState: initialMultiplayer,
    seed: 'abcd',
    onStartTimer: jasmine.createSpy('onStartTimer'),
    ...overrides,
  };
  return {props, e: shallow(<PrepareDecision {...props} />)};
}

describe('PrepareDecision', () => {
  it('Shows the prelude', () => {
    const {e} = setup({});
    expect(e.text()).toContain('prelude text');
  });
  it('triggers onStartTimer when start button clicked');
});
