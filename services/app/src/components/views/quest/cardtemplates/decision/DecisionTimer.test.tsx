import * as React from 'react';
import {mount, unmountAll} from 'app/Testing';
import {initialMultiplayer} from 'app/reducers/Multiplayer';
import {initialSettings} from 'app/reducers/Settings';
import {defaultContext} from '../Template';
import {ParserNode} from '../TemplateTypes';
import DecisionTimer, {Props} from './DecisionTimer';
import {EMPTY_DECISION_STATE, LeveledSkillCheck} from './Types';

const TEST_LEVELED_CHECKS: LeveledSkillCheck[] = [
  {skill: 'athletics', difficulty: 'easy', persona: 'light', requiredSuccesses: 1},
  {skill: 'charisma', difficulty: 'medium', persona: 'dark', requiredSuccesses: 2},
  {skill: 'knowledge', difficulty: 'hard', persona: 'light', requiredSuccesses: 3},
];

const cheerio: any = require('cheerio');
const TEST_NODE = new ParserNode(cheerio.load(`
  <decision>
    <p>prelude text</p>
    <event on="athletics success"></event>
    <event on="athletics failure"></event>
  </decision>`)('decision'), defaultContext());

function setup(overrides: Partial<Props>) {
  const node = TEST_NODE.clone();
  node.ctx.templates.decision = {
    ...EMPTY_DECISION_STATE,
    leveledChecks: TEST_LEVELED_CHECKS,
  };
  const props: Props = {
    theme: 'light',
    settings: initialSettings,
    node,
    multiplayerState: initialMultiplayer,
    rng: () => 0,
    roundTimeTotalMillis: 5000,
    onSelect: jasmine.createSpy('onSelect'),
    ...overrides,
  };
  return {props, e: mount(<DecisionTimer {...props} />)};
}

describe('DecisionTimer', () => {
  afterEach(unmountAll);

  test('Shows the skill and num successes needed', () => {
    const {e} = setup({});
    const result = e.find('.secondary').text();
    expect(result).toMatch(/1 \w+ athletics/);
    expect(result).toMatch(/2 \w+ charisma/);
    expect(result).toMatch(/3 \w+ knowledge/);
  });
  test('Either shows persona or difficulty, not both', () => {
    const {e} = setup({});
    const result = e.find('.secondary').childAt(0).text();
    expect(result).toMatch(/^\d \w+ (charisma|athletics|knowledge)$/);
  });
  test('triggers onSelect when a decision is selected', () => {
    const {props, e} = setup({});
    e.find('button').at(0).simulate('click');
    expect(props.onSelect).toHaveBeenCalledWith(props.node, TEST_LEVELED_CHECKS[0], jasmine.any(Number));
  });
  test('picks unique leveled checks', () => {
    const node = TEST_NODE.clone();
    node.ctx.templates.decision = {
      ...EMPTY_DECISION_STATE,
      leveledChecks: [
        TEST_LEVELED_CHECKS[0],
        TEST_LEVELED_CHECKS[0],
        TEST_LEVELED_CHECKS[0],
        TEST_LEVELED_CHECKS[0],
        ...TEST_LEVELED_CHECKS,
        TEST_LEVELED_CHECKS[0],
        TEST_LEVELED_CHECKS[0],
        TEST_LEVELED_CHECKS[0],
        TEST_LEVELED_CHECKS[0]
      ],
    };
    const {props, e} = setup({node});
    expect(e.text()).toContain(TEST_LEVELED_CHECKS[1].skill);
    expect(e.text()).toContain(TEST_LEVELED_CHECKS[2].skill);
  });
  test.skip('falls back to generated checks if it cannot parse any', () => {/* TODO */});
});
