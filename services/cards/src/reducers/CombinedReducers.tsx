import { combineReducers } from 'redux';
import Cards from './Cards';
import Filters from './Filters';
import Layout from './Layout';

export default combineReducers({
  cards: Cards,
  filters: Filters,
  layout: Layout,
});
