import * as React from 'react';
import { shallow } from 'enzyme';
import { ScrollBottom } from './ScrollBottom';
test('shows children and scrolls the attached element to its current bottom', () => {
  const view = shallow(
    <ScrollBottom>
      <span>Latest scope</span>
    </ScrollBottom>,
  );
  expect(view.find('span').text()).toBe('Latest scope');
  const instance = view.instance() as ScrollBottom;
  const element = { scrollTop: 0, scrollHeight: 250 };
  instance.onRef(element);
  expect(element.scrollTop).toBe(250);
  element.scrollHeight = 400;
  instance.onRef(element);
  expect(element.scrollTop).toBe(400);
  expect(() => instance.onRef(null)).not.toThrow();
});
