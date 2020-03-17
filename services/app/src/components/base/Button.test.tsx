import * as React from 'react';
import Button from './Button';
import {mount} from 'app/Testing';

describe('Button', () => {
  function setup(overrides?: any) {
    const props: any = {
      onClick: jasmine.createSpy('onClick'),
      ...overrides,
    };
    return {props, e: mount(<Button {...(props as any)} />)};
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
