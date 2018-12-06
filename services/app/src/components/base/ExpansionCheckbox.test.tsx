import {mount} from 'app/Testing';
import * as React from 'react';

import ExpansionCheckBox, { IProps } from './ExpansionCheckbox';

describe('ExpansionCheckBox', () => {

  function createElement(contentSets= {}) {
    const props: IProps = {
      onChange: jest.fn(),
      contentSets: { horror: true, ...contentSets },
      value: undefined,
    };
    const elem = mount(<ExpansionCheckBox {...props} />);
    return {elem, props};
  }

  test('changes search param values when onChange is clicked', () => {
    const {elem, props} = createElement();
    elem.find('Checkbox#horror').prop('onChange')('horror');
    expect(props.onChange).toHaveBeenCalledWith(['horror']);
  });

  test('default horror expansion is selected based on settings', () => {
    const {elem} = createElement();
    expect(elem.find('input#horror').props().checked).toBe(true);
    expect(elem.find('input#future').props().disabled).toBe(true);
  });

  test('default horror and future expansion is selected based on settings', () => {
    const {elem} = createElement({ future: true });
    expect(elem.find('input#horror').props().checked).toBe(true);
    expect(elem.find('input#future').props().checked).toBe(true);
  });

  test('default no expansion is selected based on settings', () => {
    const {elem} = createElement({ horror: false });
    expect(elem.find('input#horror').props().disabled).toBe(true);
    expect(elem.find('input#future').props().disabled).toBe(true);
  });

});
