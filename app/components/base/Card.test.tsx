import * as React from 'react'
import {configure, shallow} from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
configure({ adapter: new Adapter() });
import ExpeditionCard, {ExpeditionCardProps} from './Card'

describe('Card', () => {
  function setup(overrides?: Partial<ExpeditionCardProps>) {
    const props: ExpeditionCardProps = {
      onReturn: jasmine.createSpy('onReturn'),
      ...overrides,
    };
    const wrapper = shallow(<ExpeditionCard {...props}/>, undefined /*renderOptions*/);
    return {props, wrapper};
  }

  it('triggers onReturn when return button tapped', () => {
    const {props, wrapper} = setup();
    wrapper.find('#titlebarReturnButton').simulate('click');
    expect(props.onReturn).toHaveBeenCalledTimes(1);
  });

  it('displays card title', () => {
    const {props, wrapper} = setup({title: 'title'});
    expect(wrapper.find('.title').text()).toBe('title');
  });

  it('opens ios/android-specific rating pages on menu -> rate');

  it('Promps user to confirm if they try to go home while in a quest');

  it('Cancelling a go home while in quest does not trigger a go home');

  it('applies default card and quest theme classes', () => {
    const {props, wrapper} = setup();
    expect(wrapper.find('.base_card').hasClass('card_theme_light')).toBe(true);
    expect(wrapper.find('.base_card').hasClass('quest_theme_base')).toBe(true);
  });

  // TODO mock out quest state, specifically .details.theme
  it('applies provided card and quest theme classes', () => {
    const {props, wrapper} = setup({theme: 'dark'});
    expect(wrapper.find('.base_card').hasClass('card_theme_dark')).toBe(true);
  });
});
