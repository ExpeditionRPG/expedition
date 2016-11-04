import { combineReducers } from 'redux'
import {quest} from './quest'
import {dirty} from './dirty'
import {user} from './user'
import {dialogs} from './dialogs'
import {errors} from './errors'
import preview from 'expedition-app/app/reducers/CombinedReducers'

const questIDEApp = combineReducers({
  quest,
  dirty,
  user,
  dialogs,
  errors,
  preview
});

export default questIDEApp;