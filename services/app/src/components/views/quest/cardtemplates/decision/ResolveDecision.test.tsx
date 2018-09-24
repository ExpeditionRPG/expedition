import {configure, mount} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
configure({ adapter: new Adapter() });
import {initialMultiplayer} from 'app/reducers/Multiplayer';
import {initialSettings} from 'app/reducers/Settings';
import {numAdventurers} from '../PlayerCount';
import {defaultContext} from '../Template';
import {ParserNode} from '../TemplateTypes';
import ResolveDecision, {Props} from './ResolveDecision';
import {EMPTY_LEVELED_CHECK} from './Types';

const cheerio: any = require('cheerio');
const TEST_NODE = new ParserNode(cheerio.load('<combat><e>Test</e><e>Lich</e><e>lich</e><event on="win"></event><event on="lose"></event></combat>')('combat'), defaultContext());

function setup(overrides: Partial<Props>) {
  const props: Props = {
    theme: 'light',
    settings: {...initialSettings, showHelp: true},
    node: TEST_NODE.clone(),
    multiplayerState: {...initialMultiplayer},
    rng: () => 0,
    onCombatDecisionEnd: jasmine.createSpy('onEnd'),
    onRoll: jasmine.createSpy('onRoll'),
    onReturn: jasmine.createSpy('onReturn'),
    ...overrides,
  };
  const e = mount(<ResolveDecision {...props} />);
  return {props, e};
}

function titleWithProps(overrides: Partial<Props>): string {
  const {e} = setup(overrides);
  return e.childAt(0).prop('title');
}

describe('ResolveDecision', () => {
  test('shows a "roll & resolve" element when outcome is null', () => {
    expect(setup({}).e.text()).toContain('1 Success Needed');
  });
  test('shows a "roll & resolve" element when outcome=retry', () => {
    const node = TEST_NODE.clone();
    node.ctx.templates.decision = {
      leveledChecks: [],
      selected: {...EMPTY_LEVELED_CHECK, requiredSuccesses: 2},
      rolls: [10],
    };
    expect(setup({node}).e.text()).toContain('Failed; 2 Successes Needed');
  });
  test('shows success page on outcome=success', () => {
    const node = TEST_NODE.clone();
    node.ctx.templates.decision = {
      leveledChecks: [],
      selected: {...EMPTY_LEVELED_CHECK, requiredSuccesses: 1},
      rolls: [20],
    };
    expect(titleWithProps({node})).toEqual('Success!');
  });
  test('shows failure page on outcome=failure', () => {
    const node = TEST_NODE.clone();
    node.ctx.templates.decision = {
      leveledChecks: [],
      selected: {...EMPTY_LEVELED_CHECK, requiredSuccesses: 1},
      rolls: [1],
    };
    expect(titleWithProps({node})).toEqual('Failure!');
  });
  test('shows interrupted page on outcome=interrupted', () => {
    const node = TEST_NODE.clone();
    const numAdv = numAdventurers(initialSettings, initialMultiplayer);
    const rolls = [];
    for (let i = 0; i < numAdv; i++) {
      rolls.push(10);
    }
    node.ctx.templates.decision = {
      leveledChecks: [],
      selected: {...EMPTY_LEVELED_CHECK, requiredSuccesses: 1},
      rolls,
    };
    expect(titleWithProps({node})).toEqual('Interrupted!');
  });
});
