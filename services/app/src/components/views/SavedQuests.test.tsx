import {configure, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import SavedQuests, {Props} from './SavedQuests';
configure({ adapter: new Adapter() });

function setup(props: Partial<Props>) {
  const wrapper = render(<SavedQuests {...(props as any as Props)} />, undefined /*renderOptions*/);
  return {props, wrapper};
}

describe('SavedQuests', () => {
  test('prompts the user when there are no saved quests', () => {
    const {wrapper} = setup({
      saved: [],
    });
    expect(wrapper.text()).toContain('You have no saved/offline quests.');
  });
});
