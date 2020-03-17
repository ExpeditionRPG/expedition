import {mount} from 'app/Testing';
import {Expansion} from 'shared/schema/Constants';
import * as React from 'react';

import ExpansionCheckBox from './ExpansionCheckbox';

jest.useFakeTimers();

describe('ExpansionCheckBox', () => {

  function setup(contentSets: any[] = []) {
    const props: any = {
      onChange: jest.fn(),
      contentSets: new Set(contentSets),
      value: [],
    };
    const elem = mount(<ExpansionCheckBox {...props} />);
    return {elem, props};
  }

  test('changes search param values when onChange is clicked', () => {
    const {elem, props} = setup([Expansion.horror]);
    (elem.find('Checkbox#horror').prop('onChange') as any)(Expansion.horror);
    expect(props.onChange).toHaveBeenCalledWith([Expansion.horror]);
  });

  test('default horror expansion is selected based on settings', () => {
    const {elem, props} = setup([Expansion.horror]);
    jest.runOnlyPendingTimers();
    expect(props.onChange).toHaveBeenCalledWith([Expansion.horror]);
    expect(elem.find('input#future').props().disabled).toBe(true);
  });

  test('default horror and future expansion is selected based on settings', () => {
    const {props} = setup([Expansion.horror, Expansion.future]);
    jest.runOnlyPendingTimers();
    expect(props.onChange).toHaveBeenCalledWith([Expansion.horror, Expansion.future]);
  });

  test('default no expansion is selected based on settings', () => {
    const {elem, props} = setup([]);
    jest.runOnlyPendingTimers();
    expect(props.onChange).toHaveBeenCalledWith([]);
    expect(elem.find('input#horror').props().disabled).toBe(true);
    expect(elem.find('input#future').props().disabled).toBe(true);
  });

});
