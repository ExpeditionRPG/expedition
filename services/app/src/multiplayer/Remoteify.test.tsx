import {remoteify, getMultiplayerAction, clearMultiplayerActions} from './Remoteify';

describe('Remoteify', () => {
  beforeEach(clearMultiplayerActions);
  afterEach(clearMultiplayerActions);

  test('getMultiplayerAction can get remotified actions', () => {
    function testAction1() {}
    const remoted = remoteify(testAction1);
    expect(getMultiplayerAction('testAction1')).toEqual(remoted);
  });

  test('clearMultiplayerActions', () => {
    function testAction1() {}
    const remoted = remoteify(testAction1);
    clearMultiplayerActions();
    expect(getMultiplayerAction('testAction1')).toEqual(undefined);
  });
});
