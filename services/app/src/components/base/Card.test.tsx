import {configure, shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
configure({ adapter: new Adapter() });
import Card, {Props} from './Card';

describe('Card', () => {
  function setup(overrides?: Partial<Props>) {
    const props: Props = {
      onReturn: jasmine.createSpy('onReturn'),
      ...overrides,
    };
    const wrapper = shallow(<Card {...props}/>, undefined /*renderOptions*/);
    return {props, wrapper};
  }

  test('triggers onReturn when return button tapped', () => {
    const {props, wrapper} = setup();
    wrapper.find('#titlebarReturnButton').simulate('click');
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
    const {wrapper} = setup({});
    wrapper.find('#menuButton').simulate('click', {currentTarget: wrapper.find('#menuButton')});
    expect(wrapper.state('anchorEl')).toBeDefined();
    wrapper.find('#homeButton').simulate('click');
    expect(wrapper.state('anchorEl')).not.toBeDefined();
  });
});
