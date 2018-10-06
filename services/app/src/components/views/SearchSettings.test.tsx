describe('SearchSettings', () => {
  function setup() {
    const props: SearchSettingsCardProps = {
      user: loggedOutUser,
      settings: initialSettings,
      search: initialSearch.search,
      onSearch: jasmine.createSpy('onSearch'),
    };
    const wrapper = shallow(<SearchSettingsCard {...props} />);
    return {props, wrapper};
  }

  test('propagates user selections when Search is pressed', () => {
    const {props, wrapper} = setup();
    const inst = wrapper.instance();
    expect(inst.state).toEqual(initialSearch.search);
    for (const k of Object.keys(TEST_SEARCH)) {
      wrapper.find('#'+k)
        .simulate('change', { target: { value: TEST_SEARCH[k] } }, TEST_SEARCH[k], TEST_SEARCH[k]);
    }

    wrapper.find('#search').simulate('click');
    expect(props.onSearch).toHaveBeenCalledWith(TEST_SEARCH, jasmine.any(Object));
  });

  test('propagates user selections when form is submitted', () => {
    const {props, wrapper} = setup();
    const inst = wrapper.instance();
    expect(inst.state).toEqual(initialSearch.search);
    for (const k of Object.keys(TEST_SEARCH)) {
      wrapper.find('#'+k)
        .simulate('change', { target: { value: TEST_SEARCH[k] } }, TEST_SEARCH[k], TEST_SEARCH[k]);
    }

    wrapper.find('input').first().simulate('keypress', {key: 'Enter'});
    expect(props.onSearch).toHaveBeenCalledWith(TEST_SEARCH, jasmine.any(Object));
  });
});
