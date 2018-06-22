import { combineReducers } from 'redux'
import Cards from './Cards'
import Filters from './Filters'

export default combineReducers({
  cards: Cards,
  filters: Filters,
});
