import {configure, render} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import SavedQuests, {SavedQuestsProps} from './SavedQuests';
configure({ adapter: new Adapter() });

function setup(props: Partial<SavedQuestsProps>) {
  const wrapper = render(<SavedQuests {...(props as any as SavedQuestsProps)} />, undefined /*renderOptions*/);
  return {props, wrapper};
}

describe('SavedQuests', () => {
  it('promps the user when there are no saved quests', () => {
    const {wrapper} = setup({
      saved: [],
    });
    expect(wrapper.text()).toContain('You have no saved/offline quests.');
  });
});
