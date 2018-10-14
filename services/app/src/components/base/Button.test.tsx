import * as React from 'react';
import Button, {Props} from './Button';
import {mount, unmountAll} from 'app/Testing';

describe('Button', () => {
  function setup(overrides?: Partial<BaseDialogProps>) {
    const props: Props = {
      onClick: jasmine.createSpy('onClick'),
      ...overrides,
    };
    return {props, e: mount(<Button {...(props as any as Props)} />)};
  }

  test('Forwards tap events', () => {
    const {props, e} = setup({disabled: false});
    e.find('button').simulate('click');
    expect(props.onClick).toHaveBeenCalled();
  });

  test('Does nothing if tapped while disabled', () => {
    const {props, e} = setup({disabled: true});
    e.find('button').simulate('click');
    expect(props.onClick).not.toHaveBeenCalled();
  });

  test('Disables built-in ripple when multiplayer is active', () => {
    const {e} = setup({id: "btn", hasMultiplayerSession: true});
    expect(e.find('Button').prop('disableRipple')).toEqual(true);
  });
});
