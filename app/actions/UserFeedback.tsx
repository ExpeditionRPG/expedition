import {UserFeedbackChangeAction, UserFeedbackClearAction} from './ActionTypes'

export function userFeedbackChange(userFeedback: any): UserFeedbackChangeAction {
  return {type: 'USER_FEEDBACK_CHANGE', userFeedback};
}

export function userFeedbackClear(): UserFeedbackClearAction {
  return {type: 'USER_FEEDBACK_CLEAR'};
}
