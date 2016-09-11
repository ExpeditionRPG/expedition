import { combineReducers } from 'redux'
import {editor} from './editor'
import {quest} from './quest'
import {dirty} from './dirty'
import {drawer} from './drawer'
import {user} from './user'
import {dialogs} from './dialogs'
import {errors} from './errors'

const questIDEApp = combineReducers({
  editor,
  quest,
  dirty,
  drawer,
  user,
  dialogs,
  errors
});

export default questIDEApp;