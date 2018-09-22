import { combineReducers } from 'redux';
import Cards from './Cards';
import Filters from './Filters';
import Ui from './Ui';

export default combineReducers({
  cards: Cards,
  filters: Filters,
  ui: Ui,
});
