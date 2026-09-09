import * as React from 'react';
import { shallow } from 'enzyme';
import Button from 'app/components/base/Button';
import Card from 'app/components/base/Card';
import { initialSettings } from 'app/reducers/Settings';
import { initialMultiplayer } from 'app/reducers/Multiplayer';
import { EMPTY_COMBAT_STATE } from './Types';
import PrepareTimer from './PrepareTimer';
test.each([true, false])(
  'shows preparation instructions and starts timer (multitouch=%s)',
  multitouch => {
    const props: any = {
      settings: { ...initialSettings, showHelp: true, multitouch },
      theme: 'dark',
      onTimerStart: jest.fn(),
    };
    const e = shallow(<PrepareTimer {...props} />);
    expect(e.find(Card).prop('title')).toBe('Prepare for Combat');
    expect(
      e
        .find('p')
        .map(p => p.text())
        .join(' '),
    ).toContain(multitouch ? 'Place your finger' : 'Tap the screen');
    e.find(Button).simulate('click');
    expect(props.onTimerStart).toHaveBeenCalledTimes(1);
  },
);
