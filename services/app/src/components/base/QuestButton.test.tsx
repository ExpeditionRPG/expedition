import {configure, render} from 'enzyme';
import * as React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import {TUTORIAL_QUESTS} from 'app/Constants';
import {Partition} from 'shared/schema/Constants';
import QuestButton, {Props} from './QuestButton';
import {newMockStore} from 'app/Testing';
import {Provider} from 'react-redux';
import {loggedOutUser} from 'app/reducers/User';
import {initialSettings} from 'app/reducers/Settings';
import {Quest} from 'shared/schema/Quests';
configure({ adapter: new Adapter() });

const Moment = require('moment');

const NEW_QUEST_ICON_SUBSTR = 'seedling_small.svg';

describe('QuestButton', () => {
  function setup(overrides?: Partial<Props>) {
    const props: Props = {
      lastLogin: new Date(),
      isOffline: false,
      lastPlayed: null,
      quest: TUTORIAL_QUESTS[0],
      onClick: jasmine.createSpy('onClick'),
      ...overrides,
    };
    const store = newMockStore({saved: {list: []}, userQuests: {history: {}}, user: loggedOutUser});
    const e = render(<Provider store={store}><QuestButton {...(props as any as Props)} /></Provider>, undefined /*renderOptions*/);
    return {props, e};
  }

  test('displays no expansion icons when quest has no expansions', () => {
    const html = setup({quest: new Quest({...TUTORIAL_QUESTS[0], expansionhorror: false, expansionfuture: false})}).e.html();
    expect(html).not.toContain('horror_small.svg');
    expect(html).not.toContain('future_small.svg');
  });

  test('displays offline icon when quest is available offline', () => {
    const html = setup({isOffline: true}).e.html();
    expect(html).toContain('offline_small.svg');
  });

  test('hides offline icon when quest is not offline', () => {
    const html = setup({isOffline: false}).e.html();
    expect(html).not.toContain('offline_small.svg');
  });

  test('displays horror icon when a quest uses the Horror expansion', () => {
    const html = setup({quest: new Quest({...TUTORIAL_QUESTS[0], expansionhorror: true})}).e.html();
    expect(html).toContain('horror_small.svg');
  });

  test('displays no book icon when a quest does not require pen and paper', () => {
    const html = setup({quest: new Quest({...TUTORIAL_QUESTS[0], requirespenpaper: false})}).e.html();
    expect(html).not.toContain('book_small.svg');
  });

  test('displays "new" icon if quest created in past 7 days', () => {
    const html = setup({
      lastLogin: Moment(),
      quest: new Quest({...TUTORIAL_QUESTS[0],
        created: Moment().subtract(6, 'days')
      })
    }).e.html();
    expect(html).toContain(NEW_QUEST_ICON_SUBSTR);
  });

  test('displays "new" icon if quest created since last login', () => {
    const html = setup({
      lastLogin: Moment().subtract(30, 'days'),
      quest: new Quest({...TUTORIAL_QUESTS[0],
        created: Moment().subtract(20, 'days')
      })
    }).e.html();
    expect(html).toContain(NEW_QUEST_ICON_SUBSTR);
  });

  test('does not display "new" icon if quest created before last login', () => {
    const html = setup({
      lastLogin: Moment(),
      quest: new Quest({...TUTORIAL_QUESTS[0],
        created: Moment().subtract(30, 'days')
      })
    }).e.html();
    expect(html).not.toContain(NEW_QUEST_ICON_SUBSTR);
  });

  test('does not display "new" icon if quest has been played', () => {
    const html = setup({
      lastLogin: Moment().subtract(30, 'days'),
      lastPlayed: Moment(),
      quest: new Quest({...TUTORIAL_QUESTS[0],
        created: Moment(),
      })
    }).e.html();
    expect(html).not.toContain(NEW_QUEST_ICON_SUBSTR);
  });

  test('does not show played icon if quest has not been played', () => {
    const html = setup({}).e.html();
    expect(html).not.toContain('checkmark_small.svg');
  });

  test('displayed played icon if quest has been played before', () => {
    const html = setup({lastPlayed: Moment()}).e.html();
    expect(html).toContain('checkmark_small.svg');
  });

  test('does not display awarded icon when quest not awarded', () => {
    const html = setup({quest: {...TUTORIAL_QUESTS[0], awarded: null}}).e.html();
    expect(html).not.toContain('trophy_small.svg');
  });

  test('displays awarded icon if quest has received award', () => {
    const html = setup({quest: {...TUTORIAL_QUESTS[0], awarded: 'The Bob Medal For Questing Mediocrity'}}).e.html();
    expect(html).toContain('trophy_small.svg');
  });

  test('does not display official icon if quest is not official', () => {
    const html = setup({quest: {...TUTORIAL_QUESTS[0], official: false}}).e.html();
    expect(html).not.toContain('logo_outline_small.svg');
  });

  test('displays official icon if quest is official', () => {
    const html = setup({quest: {...TUTORIAL_QUESTS[0], official: true}}).e.html();
    expect(html).toContain('logo_outline_small.svg');
  });

  test('shows private icon when quest is private', () => {
    const html = setup({quest: {...TUTORIAL_QUESTS[0], partition: Partition.expeditionPrivate}}).e.html();
    expect(html).toContain('private_small.svg');
  });
  test('hides private icon when quest is not private', () => {
    const html = setup({quest: {...TUTORIAL_QUESTS[0], partition: Partition.expeditionPrivate}}).e.html();
    expect(html).toContain('private_small.svg');
  });
});
