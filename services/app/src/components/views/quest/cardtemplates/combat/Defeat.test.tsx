import * as React from 'react';
import { shallow } from 'enzyme';
import Button from 'app/components/base/Button';
import Card from 'app/components/base/Card';
import { initialSettings } from 'app/reducers/Settings';
import { initialMultiplayer } from 'app/reducers/Multiplayer';
import { EMPTY_COMBAT_STATE } from './Types';
import Defeat from './Defeat';
function setup(end: boolean) {
  const props: any = {
    node: { handleAction: jest.fn(() => ({ isEnd: () => end })) },
    combat: EMPTY_COMBAT_STATE,
    settings: initialSettings,
    onRetry: jest.fn(),
    onEvent: jest.fn(),
  };
  return { props, e: shallow(<Defeat {...props} />) };
}
test('does not show Retry when defeat continues the story', () => {
  const { e } = setup(false);
  expect(e.find(Button)).toHaveLength(1);
  expect(e.find(Button).children().text()).toBe('Next');
});
test('offers Retry when defeat ends the quest', () => {
  const { e, props } = setup(true);
  expect(e.find(Button)).toHaveLength(2);
  expect(props.node.handleAction).toHaveBeenCalledWith('lose');
});
test('Retry invokes the rewind callback while Next follows the lose event', () => {
  const { e, props } = setup(true);
  e.find(Button).at(0).simulate('click');
  expect(props.onRetry).toHaveBeenCalledTimes(1);
  e.find(Button).at(1).simulate('click');
  expect(props.onEvent).toHaveBeenCalledWith(props.node, 'lose');
});
