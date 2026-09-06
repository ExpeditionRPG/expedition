import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { LoginButton, LoginButtonProps } from './LoginButton';

// The component talks to Google Identity Services via the `google` global that
// the GIS script installs on window. jsdom has no such script, so stand one up.
const initialize = jest.fn();
const renderButton = jest.fn();

beforeEach(() => {
  initialize.mockClear();
  renderButton.mockClear();
  (global as any).google = { accounts: { id: { initialize, renderButton } } };
});

afterEach(() => {
  delete (global as any).google;
});

function props(overrides?: Partial<LoginButtonProps>): LoginButtonProps {
  return {
    clientId: 'test-client-id',
    onLogin: jest.fn(),
    ...overrides,
  };
}

describe('LoginButton', () => {
  test('renders a single container div for Google to draw into', () => {
    const e = shallow(<LoginButton {...props()} />);
    expect(e.find('div')).toHaveLength(1);
    expect(e.children()).toHaveLength(0);
  });

  test('initializes Google Identity Services with the given client ID', () => {
    shallow(<LoginButton {...props({ clientId: 'my-client-id' })} />);
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(initialize.mock.calls[0][0].client_id).toEqual('my-client-id');
  });

  test('renders the Google button into its own DOM node once mounted', () => {
    const e = mount(<LoginButton {...props()} />);
    expect(renderButton).toHaveBeenCalledTimes(1);
    expect(renderButton.mock.calls[0][0]).toBe(e.getDOMNode());
    expect(renderButton.mock.calls[0][1]).toEqual({
      text: 'signin_with',
      theme: 'filled_black',
    });
  });

  test('does not render the Google button before mount', () => {
    // tslint:disable-next-line:no-unused-expression
    new LoginButton(props());
    expect(renderButton).not.toHaveBeenCalled();
  });

  test('does not call onLogin until Google responds', () => {
    const p = props();
    mount(<LoginButton {...p} />);
    expect(p.onLogin).not.toHaveBeenCalled();
  });

  test('passes the credential to onLogin when Google invokes the callback', () => {
    const p = props();
    mount(<LoginButton {...p} />);
    const callback = initialize.mock.calls[0][0].callback;
    callback({ credential: 'test-jwt' });
    expect(p.onLogin).toHaveBeenCalledTimes(1);
    expect(p.onLogin).toHaveBeenCalledWith('test-jwt');
  });

  test('handleCredentialResponse forwards the credential to onLogin', () => {
    const p = props();
    const e = mount(<LoginButton {...p} />);
    (e.instance() as LoginButton).handleCredentialResponse({
      credential: 'another-jwt',
    });
    expect(p.onLogin).toHaveBeenCalledWith('another-jwt');
  });

  test('uses the latest onLogin when the prop changes', () => {
    const first = jest.fn();
    const second = jest.fn();
    const e = mount(<LoginButton {...props({ onLogin: first })} />);
    e.setProps({ onLogin: second });
    initialize.mock.calls[0][0].callback({ credential: 'later-jwt' });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith('later-jwt');
  });
});
