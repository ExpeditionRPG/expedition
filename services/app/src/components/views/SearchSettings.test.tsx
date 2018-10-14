import * as React from 'react';
import {mount} from 'app/Testing';
import {initialSettings} from '../../reducers/Settings';
import SearchSettings, {Props} from './SearchSettings';
import {loggedOutUser} from '../../reducers/User';
import {initialSearch} from '../../reducers/Search';
import {Quest} from 'shared/schema/Quests';
import {TEST_SEARCH} from './Search.test';

describe('SearchSettings', () => {
  function setup() {
    const props: SearchSettingsCardProps = {
      user: loggedOutUser,
      settings: initialSettings,
      params: initialSearch.params,
      onSearch: jasmine.createSpy('onSearch'),
    };
    const e = mount(<SearchSettings {...props} />);
    return {props, e};
  }

  test('propagates user selections when Search is pressed', () => {
    const {props, e} = setup();
    for (const k of Object.keys(TEST_SEARCH)) {
      e.find(((k === 'text') ? 'TextField' : 'NativeSelect') + '#'+k).prop('onChange')({ target: { value: TEST_SEARCH[k] } });
    }
    e.find('ExpeditionButton#search').prop('onClick')();
    expect(props.onSearch).toHaveBeenCalledWith(TEST_SEARCH);
  });

  test('propagates user selections when form is submitted', () => {
    const {props, e} = setup();
    for (const k of Object.keys(TEST_SEARCH)) {
      e.find(((k === 'text') ? 'TextField' : 'NativeSelect') + '#'+k).prop('onChange')({ target: { value: TEST_SEARCH[k] } });
    }
    e.find('form').prop('onSubmit')();
    expect(props.onSearch).toHaveBeenCalledWith(TEST_SEARCH);
  });
});
