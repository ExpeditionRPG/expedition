import { combineReducers } from 'redux'
import {quest} from './quest'
import {dirty} from './dirty'
import {user} from './user'
import {dialogs} from './dialogs'
import {errors} from './errors'

const questIDEApp = combineReducers({
  quest,
  dirty,
  user,
  dialogs,
  errors
});

export default questIDEApp;