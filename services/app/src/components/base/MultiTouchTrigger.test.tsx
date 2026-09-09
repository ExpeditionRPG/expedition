import * as React from 'react';
import { shallow } from 'enzyme';
import MultiTouchTrigger from './MultiTouchTrigger';
import TouchIndicator from './TouchIndicator';
import { InteractionEvent } from 'shared/multiplayer/Events';

function event(
  positions: { [id: string]: number[] },
  event = 'touchstart',
): InteractionEvent {
  return {
    type: 'INTERACTION',
    target: 'timer',
    event,
    positions,
  } as InteractionEvent;
}
test('draws local and remote points while reporting the local finger count', () => {
  const onTouchChange = jest.fn();
  const wrapper = shallow(<MultiTouchTrigger onTouchChange={onTouchChange} />);
  const instance = wrapper.instance() as MultiTouchTrigger;
  instance.remoteEvent('local', event({ '1': [200, 300], '2': [500, 600] }));
  expect(onTouchChange).toHaveBeenLastCalledWith(2);
  instance.remoteEvent('remote', event({ '1': [100, 100] }));
  expect(wrapper.find(TouchIndicator).prop('clientInputs')).toEqual({
    local: { '1': [200, 300], '2': [500, 600] },
    remote: { '1': [100, 100] },
  });
  expect(onTouchChange).toHaveBeenLastCalledWith(2);
});
test('clears released points without clearing another client', () => {
  const onTouchChange = jest.fn();
  const wrapper = shallow(<MultiTouchTrigger onTouchChange={onTouchChange} />);
  const instance = wrapper.instance() as MultiTouchTrigger;
  instance.remoteEvent('local', event({ '1': [200, 300] }));
  instance.remoteEvent('remote', event({ '2': [500, 600] }));
  instance.remoteEvent('local', event({}, 'touchend'));
  expect(onTouchChange).toHaveBeenLastCalledWith(0);
  expect(wrapper.find(TouchIndicator).prop('clientInputs')).toEqual({
    local: {},
    remote: { '2': [500, 600] },
  });
  instance.remoteEvent('remote', event({}, 'touchend'));
  expect(wrapper.find(TouchIndicator).prop('clientInputs')).toEqual({
    local: {},
    remote: {},
  });
});
