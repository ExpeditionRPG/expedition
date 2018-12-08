import * as React from 'react';
import {mount, unmountAll} from 'app/Testing';
import PlayerCount, {Props} from './PlayerCount';
import {MAX_ADVENTURERS} from 'app/Constants';

describe('PlayerCount', () => {

  afterEach(unmountAll);

  function setup(overrides?: Partial<Props>) {
    const props: Props = {
      allPlayers: 4,
      localPlayers: 3,
      id: 'testid',
      onChange: jasmine.createSpy('onChange'),
      ...overrides,
    };
    const e = mount(<PlayerCount {...(props as any as Props)} />);
    return {props, e};
  }
  test('can adjust up', () => {
    const {e, props} = setup();
    e.find('Picker').prop('onDelta')(1);
    expect(props.onChange).toHaveBeenCalledWith(4);
  });
  test('can adjust down', () => {
    const {e, props} = setup();
    e.find('Picker').prop('onDelta')(-1);
    expect(props.onChange).toHaveBeenCalledWith(2);
  });
  test('does not go above MAX_ADVENTURERS players', () => {
    const {e, props} = setup({allPlayers: MAX_ADVENTURERS, localPlayers: MAX_ADVENTURERS});
    e.find('Picker').prop('onDelta')(1);
    expect(props.onChange).not.toHaveBeenCalled();
  });
  test('does not go below 1 player (local)', () => {
    const {e, props} = setup({allPlayers: 1, localPlayers: 1});
    e.find('Picker').prop('onDelta')(-1);
    expect(props.onChange).not.toHaveBeenCalled();
  });
  test('allows backing down when over limit', () => {
    const {e, props} = setup({allPlayers: 7, localPlayers: 7});
    e.find('Picker').prop('onDelta')(-1);
    expect(props.onChange).toHaveBeenCalledWith(6);
  });
  test('shows solo play details when one player', () => {
    const text = setup({allPlayers: 1, localPlayers: 1}).e.text();
    expect(text).toContain('Solo play');
  });
  test('shows count across all devices when multiplayer', () => {
    const text = setup({allPlayers: 3, localPlayers: 1}).e.text();
    expect(text).toContain('across all devices');
  });
  test('hides count across all devices when no multiplayer', () => {
    const text = setup({allPlayers: 3, localPlayers: 3}).e.text();
    expect(text).not.toContain('across all devices');
  });
})
