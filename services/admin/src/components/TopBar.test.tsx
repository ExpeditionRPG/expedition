import { mount } from 'enzyme';
import * as React from 'react';
import { ViewState } from '../reducers/StateTypes';
import { defaultView } from '../reducers/View';
import TopBar, { Props } from './TopBar';

describe('TopBar', () => {
  function setup(view: Partial<ViewState>) {
    const props: Props = {
      view: { ...defaultView, ...view },
      user: {
        displayName: 'Admin',
        email: 'admin@test.com',
        id: 'u1',
        image: '',
        loggedIn: true,
      },
      onUserDialogRequest: jest.fn(),
      onFilterUpdate: jest.fn(),
    };
    return { props, e: mount(<TopBar {...props} />) };
  }

  test('shows no warning when the last query succeeded', () => {
    const { e } = setup({ view: 'QUESTS', lastQueryError: null });
    expect(e.find('Tooltip').length).toEqual(0);
  });

  test('shows the query error text on the warning icon', () => {
    // Without a tooltip the warning icon was the only trace of the failure,
    // so lastQueryError.error was never rendered anywhere at all.
    const { e } = setup({
      view: 'QUESTS',
      lastQueryError: {
        view: 'QUESTS',
        error: Error('You are not signed in.'),
      },
    });
    const tooltip = e.find('Tooltip');
    expect(tooltip.length).toEqual(1);
    expect(tooltip.first().prop('title')).toEqual(
      'Error: You are not signed in.',
    );
  });

  test('does not show an error raised by a different view', () => {
    const { e } = setup({
      view: 'USERS',
      lastQueryError: { view: 'QUESTS', error: Error('boom') },
    });
    expect(e.find('Tooltip').length).toEqual(0);
  });
});
