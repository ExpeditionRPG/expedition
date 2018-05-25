import * as React from 'react'
import {render} from 'enzyme'
import {Provider} from 'react-redux'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import Compositor, {CompositorProps} from './Compositor'
import {initialCardState} from '../reducers/Card'
import {initialQuestState} from '../reducers/Quest'
import {initialSettings} from '../reducers/Settings'
import {initialSnackbar} from '../reducers/Snackbar'
import {newMockStore} from '../Testing'

require('react-tap-event-plugin')();

const renderOptions = {context: {muiTheme: getMuiTheme()}, childContextTypes: {muiTheme: React.PropTypes.object}};

function setup(props: Partial<CompositorProps>) {
  props = {
    card: initialCardState,
    quest: initialQuestState,
    theme: 'light',
    transition: 'INSTANT',
    settings: initialSettings,
    snackbar: initialSnackbar,
    ...props,
  };
  const wrapper = render(
    <Provider store={newMockStore({saved: {}, ...props})}>
      <Compositor {...(props as any as CompositorProps)} />
    </Provider>,
    renderOptions
  );
  return {props, wrapper};
}

describe('Compositor', () => {
  it('Renders provided card, i.e. splash screen', () => {
    const {wrapper} = setup({});
    expect(wrapper.text()).toContain('To Begin:');
  });
});
