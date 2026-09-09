import * as React from 'react';
import { shallow } from 'enzyme';
import Button from 'app/components/base/Button';
import Card from 'app/components/base/Card';
import { initialSettings } from 'app/reducers/Settings';
import { initialMultiplayer } from 'app/reducers/Multiplayer';
import { EMPTY_COMBAT_STATE } from './Types';
import Surge from './Surge';
test('shows a surge warning and wires both navigation controls', () => {
  const props: any = {
    settings: initialSettings,
    node: {},
    onReturn: jest.fn(),
    onSurgeNext: jest.fn(),
  };
  const e = shallow(<Surge {...props} />);
  expect(e.find(Card).prop('theme')).toBe('red');
  expect(e.find('h3').text()).toContain('surge');
  e.find(Button).simulate('click');
  expect(props.onSurgeNext).toHaveBeenCalledWith(props.node);
  e.find(Card).prop('onReturn')!();
  expect(props.onReturn).toHaveBeenCalledTimes(1);
});
