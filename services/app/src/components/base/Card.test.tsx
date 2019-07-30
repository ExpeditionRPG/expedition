import {mount, mountRoot, unmountAll} from 'app/Testing';
import * as React from 'react';
import Card, {Props} from './Card';
import {initialSettings} from 'app/reducers/Settings';

describe('Card', () => {
  afterEach(unmountAll);

  const EXTRA_STATE = {_history: [1,2,3], settings: initialSettings};

  function setup(overrides?: Partial<Props>) {
    const props: Props = {
      onReturn: jasmine.createSpy('onReturn'),
      ...overrides,
    };
    const wrapper = mount(<Card {...props}/>, EXTRA_STATE);
    return {props, wrapper};
  }

  test('triggers onReturn when return button tapped', () => {
    const {props, wrapper} = setup();
    wrapper.find('IconButton#titlebarReturnButton').simulate('click');
    expect(props.onReturn).toHaveBeenCalledTimes(1);
  });

  test('displays card title', () => {
    const {wrapper} = setup({title: 'title'});
    expect(wrapper.find('.title').text()).toBe('title');
  });

  test.skip('opens ios/android-specific rating pages on menu -> rate', () => { /* TODO */ });

  test.skip('prompts user to confirm if they try to go home while in a quest', () => { /* TODO */ });

  test.skip('cancelling a go home while in quest does not trigger a go home', () => { /* TODO */ });

  test('applies default card and quest theme classes', () => {
    const {wrapper} = setup();
    expect(wrapper.find('.base_card').hasClass('card_theme_light')).toBe(true);
    expect(wrapper.find('.base_card').hasClass('quest_theme_base')).toBe(true);
  });

  // TODO mock out quest state, specifically .details.theme
  test('applies provided card and quest theme classes', () => {
    const {wrapper} = setup({theme: 'dark'});
    expect(wrapper.find('.base_card').hasClass('card_theme_dark')).toBe(true);
  });

  test('always closes top-right menu when a menu button is clicked', () => {
    // We're updating mid-test, so have to use the root element here.
    const root = mountRoot(<Card/>, EXTRA_STATE);
    root.find('IconButton#menuButton').simulate('click', {currentTarget: root.find('IconButton#menuButton')});
    root.update();
    expect(root.find('Menu').prop('open')).toEqual(true);
    root.find('MenuItem#homeButton').simulate('click');
    root.update();
    expect(root.find('Menu').prop('open')).toEqual(false);
  });

  test.skip('storage errors are shown in snackbar', () => { /* TODO */ });
});
