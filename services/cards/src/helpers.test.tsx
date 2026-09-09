import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { shallow } from 'enzyme';
import { MAX_COUNTER_HEALTH } from './Constants';
import {
  healthCounter,
  horizontalCounter,
  icon,
  lootCounter,
  romanize,
} from './helpers';

test('icons use global or theme-specific artwork', () => {
  expect(React.isValidElement(icon('roll'))).toBe(true);
  expect(shallow(icon('roll')).props()).toMatchObject({
    className: 'inline_icon svg roll',
    src: '/images/icons/roll.svg',
  });
  expect(shallow(icon('roll', 'Color', 7)).prop('src')).toBe(
    '/themes/Color/images/icon/roll.svg',
  );
  expect(icon('roll', 'Color', 7).key).toBe('7');
});

test.each([
  [0, '0'],
  [1, 'I'],
  [27, 'XXVII'],
])('romanize %s becomes %s', (value, result) => {
  expect(romanize(Number(value))).toBe(result);
});

test.each([
  [0, ['0']],
  [2, ['0', '1', '2']],
  ['1,3,5', ['1', '3', '5']],
])('horizontalCounter renders exactly the labels for %s', (value, labels) => {
  expect(
    shallow(horizontalCounter(value))
      .children()
      .map(child => child.text()),
  ).toEqual(labels);
});

function tracker(element: JSX.Element) {
  const container = document.createElement('div');
  container.innerHTML = renderToStaticMarkup(element);
  return container;
}

test('10 health fits into a single side', () => {
  const result = tracker(healthCounter(10));
  expect(result.querySelectorAll('ul')).toHaveLength(1);
  expect(result.querySelectorAll('table')).toHaveLength(0);
  expect(
    Array.from(result.querySelectorAll('li'), cell => cell.textContent),
  ).toEqual(['9', '8', '7', '6', '5', '4', '3', '2', '1', '0']);
});
test('at or above max health renders the capped tracker', () => {
  expect(renderToStaticMarkup(healthCounter(MAX_COUNTER_HEALTH + 10))).toBe(
    renderToStaticMarkup(healthCounter(MAX_COUNTER_HEALTH)),
  );
  const labels = Array.from(
    tracker(healthCounter(MAX_COUNTER_HEALTH)).querySelectorAll('li, td'),
    cell => Number(cell.textContent),
  );
  expect(labels.sort((a, b) => a - b)).toEqual(
    Array.from({ length: MAX_COUNTER_HEALTH }, (_, i) => i),
  );
});
test('lootCounter with 2 has 1 and 2, with no zero', () => {
  expect(
    Array.from(
      tracker(lootCounter(2)).querySelectorAll('li'),
      cell => cell.textContent,
    ),
  ).toEqual(['2', '1']);
});
