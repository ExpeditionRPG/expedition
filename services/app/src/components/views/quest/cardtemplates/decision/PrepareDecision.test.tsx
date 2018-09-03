import {configure, mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
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
    rng: () => 0,
    onStartTimer: jasmine.createSpy('onStartTimer'),
    ...overrides,
  };
  return {props, e: mount(<PrepareDecision {...props} />)};
}

describe('PrepareDecision', () => {
  test('Shows the prelude', () => {
    const {e} = setup({});
    expect(e.text()).toContain('prelude text');
  });
  test('triggers onStartTimer when start button clicked', () => {
    const {props, e} = setup({});
    e.find('button').at(2).simulate('click');
    expect(props.onStartTimer).toHaveBeenCalled();
  });
});
