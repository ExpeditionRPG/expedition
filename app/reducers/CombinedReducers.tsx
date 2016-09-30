import { combineReducers } from 'redux'
import { card } from './card'
import { quest } from './quest'
import { settings } from './settings'

const expeditionApp = combineReducers({
  card,
  quest,
  settings,
});

export default expeditionApp;