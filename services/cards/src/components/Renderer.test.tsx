import * as React from 'react';
import { shallow } from 'enzyme';
import Renderer from './Renderer';
import { initialState } from '../reducers/Filters';
import ColorFront from '../themes/Color/CardFront';
import ColorBack from '../themes/Color/CardBack';

jest.mock('svg-injector', () => jest.fn());
const cards = Array.from({ length: 10 }, (_, i) => ({
  name: 'Card ' + i,
  sheet: 'Encounter',
  class: 'Beast',
  tier: 1,
}));
function render(mode: string, data = cards) {
  return shallow(
    <Renderer
      cards={data}
      translations={null}
      filters={{
        ...initialState,
        theme: { ...initialState.theme, current: 'Color' },
        export: { ...initialState.export, current: mode },
      }}
    />,
  );
}
beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
test('theme and print settings control fronts, backs, pagination and bleed', () => {
  const print = render('PrintAndPlay');
  expect(print.hasClass('Color')).toBe(true);
  expect(print.find('.page.fronts')).toHaveLength(2);
  expect(print.find('.page.backs')).toHaveLength(2);
  expect(print.find(ColorFront)).toHaveLength(10);
  expect(print.find(ColorBack)).toHaveLength(10);
  expect(print.find('.printInstructions')).toHaveLength(2);
  const web = render('WebView');
  expect(web.find('.page.fronts')).toHaveLength(1);
  expect(web.find(ColorBack)).toHaveLength(0);
  const professional = render('DriveThruCards');
  expect(professional.hasClass('bleed')).toBe(true);
  expect(professional.find('.page.fronts')).toHaveLength(10);
});
test('renders exactly the filtered cards in order', () => {
  const subset = cards.slice(3, 5);
  expect(
    render('FrontsOnly', subset)
      .find(ColorFront)
      .map(front => front.prop('card')),
  ).toEqual(subset);
});
test('handles zero cards without empty pages', () => {
  expect(render('WebView', []).find('.page')).toHaveLength(0);
});
