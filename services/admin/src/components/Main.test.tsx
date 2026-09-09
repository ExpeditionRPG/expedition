import * as React from 'react';
import { shallow } from 'enzyme';
import Main from './Main';
import SplashContainer from './SplashContainer';
import UsersViewContainer from './views/UsersViewContainer';

test('requires login before showing admin content', () => {
  const wrapper = shallow(
    <Main
      loggedIn={false}
      snackbar={{ open: false, message: '', actions: [], persist: false }}
      view="USERS"
      onSnackbarClose={jest.fn()}
      onViewChange={jest.fn()}
    />,
  );
  expect(wrapper.find(SplashContainer)).toHaveLength(1);
  expect(wrapper.find(UsersViewContainer)).toHaveLength(0);
  wrapper.setProps({ loggedIn: true });
  expect(wrapper.find(SplashContainer)).toHaveLength(0);
  expect(wrapper.find(UsersViewContainer)).toHaveLength(1);
});
