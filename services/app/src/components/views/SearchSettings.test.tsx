import { mount } from 'app/Testing';
import * as React from 'react';
import { initialSearch } from '../../reducers/Search';
import { initialSettings } from '../../reducers/Settings';
import { loggedOutUser } from '../../reducers/User';
import SearchSettings, { Props } from './SearchSettings';
import { Quest } from 'shared/schema/Quests';
import {TEST_SEARCH} from '../../reducers/TestData';
import {Expansion} from 'shared/schema/Constants';

describe('SearchSettings', () => {
  function setup(overrides: Partial<Props>) {
    const props: Props = {
      user: loggedOutUser,
      contentSets: new Set([Expansion.horror, Expansion.future]),
      settings: initialSettings,
      params: initialSearch.params,
      onChangeParams: jest.fn(),
      onSearch: jest.fn(),
      ...overrides,
    };
    const e = mount(<SearchSettings {...props} />);
    return { props, e };
  }

  function getNode(k) {
    if (k === 'text') {
      return `TextField#${k}`;
    }
    if (k === 'expansions') {
      return 'ExpansionCheckbox';
    }

    if(k === 'showPrivate' || k === 'showCommunity') {
      return `Checkbox#${k}`;
    }

    return `NativeSelect#${k}`;
  }

  test('triggers onChangeParams when each input changed', () => {
    const { props, e } = setup();
    for (const k of Object.keys(TEST_SEARCH)) {
      props.onChangeParams.mockClear();
      const node = getNode(k);
      const onChange =
        k === 'expansions'
          ? TEST_SEARCH[k]
          : { target: { value: TEST_SEARCH[k] } };
      e.find(node).prop('onChange')(onChange);
      expect(props.onChangeParams).toHaveBeenCalledWith({[k]: TEST_SEARCH[k]});
    }
  });

  test('propagates user selections when Search is pressed', () => {
    const { props, e } = setup({params: TEST_SEARCH});
    e.find('ExpeditionButton#search').prop('onClick')();
    expect(props.onSearch).toHaveBeenCalledWith(TEST_SEARCH);
  });

  test('propagates user selections when form is submitted', () => {
    const { props, e } = setup({params: TEST_SEARCH});
    e.find('form').prop('onSubmit')();
    expect(props.onSearch).toHaveBeenCalledWith(TEST_SEARCH);
  });

  test('changing a value to string \'null\' results in no value being unset', () => {
    const { props, e } = setup();
    e.find('NativeSelect#contentrating').prop('onChange')({
      target: { value: 'null' },
    });
    expect(props.onChangeParams).toHaveBeenCalledWith({contentrating: undefined});
  });
});
