import {configure, render} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {LanguageType} from 'shared/schema/Constants';
import {Quest} from 'shared/schema/Quests';
import {TUTORIAL_QUESTS} from '../../Constants';
import {SearchSettings} from '../../reducers/StateTypes';
import {
  renderResult,
  SearchResultProps,
} from './Search';
configure({ adapter: new Adapter() });

const Moment = require('moment');

const TEST_SEARCH: SearchSettings = {
  age: 31536000,
  contentrating: 'Teen',
  genre: 'Comedy',
  language: 'English' as LanguageType,
  maxtimeminutes: 60,
  mintimeminutes: 30,
  order: '+title',
  text: 'Test Text',
};

describe('Search', () => {
  test.skip('gracefully handles no search results', () => { /* TODO */ });
  test.skip('renders some search results', () => { /* TODO */ });
  test.skip('shows spinner when loading results', () => { /* TODO */ });
});
