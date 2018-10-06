describe('QuestButton', () => {
  function setup(questTitle: string, overrides?: Partial<SearchResultProps>, questOverrides?: Partial<Quest>) {
    const props: SearchResultProps = {
      index: 0,
      lastPlayed: null,
      offlineQuests: {},
      onQuest: jasmine.createSpy('onQuest'),
      quest: new Quest({...TUTORIAL_QUESTS.filter((el) => el.title === questTitle)[0], ...questOverrides}),
      search: TEST_SEARCH,
      ...overrides,
    };
    const wrapper = render(renderResult(props), undefined /*renderOptions*/);
    return {props, wrapper};
  }

  test('displays no expansion icons when quest has no expansions', () => {
    const {wrapper} = setup('Learning to Adventure');
    expect(wrapper.html()).not.toContain('horror');
  });

  test.skip('displays offline icon when quest is available offline', () => { /* TODO */ });

  test('displays horror icon when a quest uses the Horror expansion', () => {
    const {wrapper} = setup('Learning 2: The Horror');
    expect(wrapper.html()).toContain('horror');
  });

  test('displays no book icon when a quest does not require pen and paper', () => {
    const {wrapper} = setup('Learning to Adventure', {}, {requirespenpaper: false});
    expect(wrapper.html()).not.toContain('book');
  });

  test('displays NEW if quest created in past 7 days', () => {
    const {wrapper} = setup('Learning to Adventure', {lastLogin: Moment()}, {created: Moment().subtract(6, 'days')});
    expect(wrapper.html()).toContain('NEW');
  });

  test('displays NEW if quest created since last login', () => {
    const {wrapper} = setup('Learning to Adventure', {lastLogin: Moment().subtract(30, 'days')}, {created: Moment().subtract(20, 'days')});
    expect(wrapper.html()).toContain('NEW');
  });

  test('does not display NEW if quest created before last login', () => {
    const {wrapper} = setup('Learning to Adventure', {lastLogin: Moment()}, {created: Moment().subtract(30, 'days')});
    expect(wrapper.html()).not.toContain('NEW');
  });

  test('does not display NEW if quest has been played', () => {
    const {wrapper} = setup('Learning to Adventure', {lastLogin: Moment().subtract(30, 'days'), lastPlayed: Moment()}, {created: Moment()});
    expect(wrapper.html()).not.toContain('NEW');
  });

  test('does not display last played date if quest has not been played', () => {
    const {wrapper} = setup('Learning to Adventure');
    expect(wrapper.html()).not.toContain('questPlayedIcon');
  });

  test('displayed last played date if quest has been played before', () => {
    const {wrapper} = setup('Learning to Adventure', {lastPlayed: Moment()});
    expect(wrapper.html()).toContain('questPlayedIcon');
  });

  test('does not display awarded icon when quest not awarded', () => {
    const {wrapper} = setup('Learning to Adventure');
    expect(wrapper.html()).not.toContain('questAwardedIcon');
  });

  test('displays awarded icon if quest has received award', () => {
    const {wrapper} = setup('Learning to Adventure', {}, {awarded: 'The Bob Medal For Questing Mediocrity'});
    expect(wrapper.html()).toContain('questAwardedIcon');
  });

  test('does not display official icon if quest is not official', () => {
    const {wrapper} = setup('Learning to Adventure', {}, {official: false});
    expect(wrapper.html()).not.toContain('questOfficialIcon');
  });

  test('displays official icon if quest is official', () => {
    const {wrapper} = setup('Learning to Adventure');
    expect(wrapper.html()).toContain('questOfficialIcon');
  });

  // TODO Dedupe
  test.skip('shows horror expansion icon when quest is horror');
  test.skip('hides horror expansion icon when quest is not horror');
  test.skip('shows future expansion icon when quest is future');
  test.skip('hides future expansion icon when quest is not future');
  test.skip('shows offline icon when quest is offline');
  test.skip('hides offline icon when quest is not offline');
  test.skip('shows private icon when quest is private');
  test.skip('hides private icon when quest is not private');
  test.skip('shows official icon when quest is official');
  test.skip('hides official icon when quest is not official');
  test.skip('shows award icon when quest is awarded');
  test.skip('hides award icon when quest is not awarded');
  test.skip('shows checkmark icon when quest is played');
  test.skip('hides checkmark icon when quest is not played');
  test.skip('shows new icon when quest is new');
  test.skip('hides new icon when quest is not new');

  test.skip('shows formatted play period');
  test.skip('shows title & summary');
  test.skip('renders children');
  test.skip('triggers onClick when clicked');
});
