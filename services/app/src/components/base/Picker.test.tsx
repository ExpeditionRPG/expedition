import * as React from 'react';
import {mount, unmountAll} from 'app/Testing';
import Picker, {Props} from './Picker';

describe('Picker', () => {

  afterEach(unmountAll);

  function setup(overrides?: Partial<Props>) {
    const props: Props = {
      value: 'testvalue',
      label: 'testlabel',
      id: 'testid',
      onDelta: jasmine.createSpy('onDelta'),
      ...overrides,
    };
    const e = mount(<Picker {...(props as any as Props)} />);
    return {props, e};
  }

  test('triggers onDelta when buttons clicked', () => {
    const {e, props} = setup();
    e.find('IconButton').first().prop('onClick')();
    expect(props.onDelta).toHaveBeenCalledWith(-1);
  });

  test('shows label & value', () => {
    const text = setup().e.text();
    expect(text).toContain('testvalue');
    expect(text).toContain('testlabel');
  });
});
