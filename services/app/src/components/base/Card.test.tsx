jest.mock('../../actions/SavedQuests', () => ({
  ...jest.requireActual('../../actions/SavedQuests'),
  storeSavedQuest: jest.fn(),
}));
import { getDevice, setDeviceForTest, getWindow } from '../../Globals';
import { getStore, installStore } from '../../Store';
import { newMockStoreWithInitializedState } from '../../Testing';
import { setDialog } from '../../actions/Dialog';
import { storeSavedQuest } from '../../actions/SavedQuests';
import { URLS } from '../../Constants';
import { initialSettings } from 'app/reducers/Settings';
import { mount, mountRoot, unmountAll } from 'app/Testing';
import * as React from 'react';
import Card, { Props } from './Card';

describe('Card', () => {
  afterEach(unmountAll);

  const EXTRA_STATE = { _history: [1, 2, 3], settings: initialSettings };

  function setup(overrides?: Partial<Props>) {
    const props: Props = {
      onReturn: jest.fn(),
      ...overrides,
    };
    const wrapper = mountRoot(<Card {...props} />, EXTRA_STATE);
    return { props, wrapper };
  }

  test('triggers onReturn when return button tapped', () => {
    const { props, wrapper } = setup();
    wrapper.find('IconButton#titlebarReturnButton').simulate('click');
    expect(props.onReturn).toHaveBeenCalledTimes(1);
  });

  test('displays card title', () => {
    const { wrapper } = setup({ title: 'title' });
    expect(wrapper.find('.title').text()).toBe('title');
  });

  test('opens ios/android-specific rating pages on menu -> rate', () => {
    const device = getDevice();
    const cordova = getWindow().cordova;
    const open = jest.spyOn(window, 'open').mockReturnValue(null);
    try {
      for (const platform of ['ios', 'android'] as const) {
        setDeviceForTest({ platform });
        const { wrapper } = setup();
        wrapper.find('IconButton#menuButton').simulate('click', {
          currentTarget: document.createElement('button'),
        });
        wrapper
          .find('MenuItem')
          .filterWhere(item => item.text() === 'Rate the App')
          .simulate('click');
        expect(open).toHaveBeenLastCalledWith(URLS[platform], '_system');
      }
    } finally {
      setDeviceForTest(device);
      getWindow().cordova = cordova;
    }
  });

  test('prompts user to confirm if they try to go home while in a quest', () => {
    const previous = getStore();
    const store = newMockStoreWithInitializedState();
    installStore(store);
    try {
      const { wrapper } = setup({ inQuest: true });
      wrapper
        .find('IconButton#menuButton')
        .simulate('click', { currentTarget: document.createElement('button') });
      wrapper.find('MenuItem#homeButton').simulate('click');
      expect(store.getActions()).toEqual([setDialog('EXIT_QUEST')]);
    } finally {
      installStore(previous);
    }
  });

  test('cancelling a go home while in quest does not trigger a go home', () => {
    const previous = getStore();
    const store = newMockStoreWithInitializedState();
    installStore(store);
    try {
      const { wrapper } = setup({ inQuest: true });
      wrapper
        .find('IconButton#menuButton')
        .simulate('click', { currentTarget: document.createElement('button') });
      wrapper.find('MenuItem#homeButton').simulate('click');
      store.dispatch(setDialog(null));
      expect(store.getActions()).toEqual([
        setDialog('EXIT_QUEST'),
        setDialog(null),
      ]);
      expect(
        store
          .getActions()
          .some(
            action => action.type === 'RETURN' || action.type === 'EXIT_QUEST',
          ),
      ).toBe(false);
    } finally {
      installStore(previous);
    }
  });

  test('applies default card and quest theme classes', () => {
    const { wrapper } = setup();
    expect(wrapper.find('.base_card').hasClass('card_theme_light')).toBe(true);
    expect(wrapper.find('.base_card').hasClass('quest_theme_base')).toBe(true);
  });

  test('applies provided card and quest theme classes', () => {
    const { wrapper } = setup({ theme: 'dark', quest: { theme: 'horror' } });
    expect(wrapper.find('.base_card').hasClass('card_theme_dark')).toBe(true);
    expect(wrapper.find('.base_card').hasClass('quest_theme_horror')).toBe(
      true,
    );
  });

  test('always closes top-right menu when a menu button is clicked', () => {
    // We're updating mid-test, so have to use the root element here.
    const root = mountRoot(<Card />, EXTRA_STATE);
    root
      .find('IconButton#menuButton')
      .simulate('click', { currentTarget: root.find('IconButton#menuButton') });
    root.update();
    expect(root.find('Menu').prop('open')).toEqual(true);
    root.find('MenuItem#homeButton').simulate('click');
    root.update();
    expect(root.find('Menu').prop('open')).toEqual(false);
  });

  test.each([
    ['exceeded the quota', "Couldn't save; out of storage space.", undefined],
    [
      'disk unavailable',
      'Error saving quest: Error: disk unavailable',
      'Report',
    ],
  ])(
    'storage error %s is shown without a success message',
    async (error, message, actionLabel) => {
      const previous = getStore();
      const store = newMockStoreWithInitializedState();
      installStore(store);
      jest
        .mocked(storeSavedQuest)
        .mockReturnValue(() => Promise.reject(new Error(error)));
      try {
        const { wrapper } = setup({ inQuest: true });
        wrapper.find('IconButton#menuButton').simulate('click', {
          currentTarget: document.createElement('button'),
        });
        wrapper
          .find('MenuItem')
          .filterWhere(item => item.text() === 'Save quest')
          .simulate('click');
        await Promise.resolve();
        await Promise.resolve();
        const snackbars = store
          .getActions()
          .filter(action => action.type === 'SNACKBAR_OPEN');
        expect(snackbars).toHaveLength(1);
        expect(snackbars[0]).toMatchObject({ message });
        expect(snackbars[0].actionLabel).toBe(actionLabel);
      } finally {
        installStore(previous);
      }
    },
  );
});
