import { shallow } from 'enzyme';
import * as React from 'react';
import MultiplayerIcon from './MultiplayerIcon';

test('renders a scalable multiplayer symbol with the caller styling', () => {
  const e = shallow(<MultiplayerIcon className="connected" />);
  expect(e.type()).toBe('svg');
  expect(e.prop('viewBox')).toBe('0 0 500 500');
  expect(e.hasClass('connected')).toBe(true);
  expect(e.find('path').length).toBeGreaterThan(0);
  e.setProps({ className: 'offline' });
  expect(e.hasClass('offline')).toBe(true);
});
