import {configure, render} from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import {Provider} from 'react-redux';
import {initialCardState} from '../reducers/Card';
import {initialQuestState} from '../reducers/Quest';
import {initialSettings} from '../reducers/Settings';
import {initialSnackbar} from '../reducers/Snackbar';
import {newMockStore} from '../Testing';
import Compositor, {CompositorProps} from './Compositor';
configure({ adapter: new Adapter() });

function setup(props: Partial<CompositorProps>) {
  props = {
    card: initialCardState,
    quest: initialQuestState,
    settings: initialSettings,
    snackbar: initialSnackbar,
    theme: 'light',
    transition: 'instant',
    ...props,
  };
  const wrapper = render(
    <Provider store={newMockStore({saved: {}, ...props})}>
      <Compositor {...(props as any as CompositorProps)} />
    </Provider>,
    {} // renderOptions
  );
  return {props, wrapper};
}

describe('Compositor', () => {
  it('Renders provided card, i.e. splash screen', () => {
    const {wrapper} = setup({});
    expect(wrapper.text()).toContain('To Begin:');
  });
});
