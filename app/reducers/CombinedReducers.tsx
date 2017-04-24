import { combineReducers } from 'redux'
import Cards from './Cards'
import Filters from './Filters'
import RenderSettings from './RenderSettings'

export default combineReducers({
  cards: Cards,
  filters: Filters,
  renderSettings: RenderSettings,
});
