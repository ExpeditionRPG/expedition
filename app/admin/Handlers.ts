import * as express from 'express'
import {Feedback} from '../models/Feedback'
import {Quest} from '../models/Quests'
import {User} from '../models/Users'

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please contact support by emailing Expedition@Fabricate.io';

export function queryFeedback(feedback: Feedback, req: express.Request, res: express.Response) {
  console.error('Unimplemented');
  return res.status(500).send(GENERIC_ERROR_MESSAGE);
}

export function modifyFeedback(feedback: Feedback, req: express.Request, res: express.Response) {
  console.error('Unimplemented');
  return res.status(500).send(GENERIC_ERROR_MESSAGE);
}

export function queryQuest(quest: Quest, req: express.Request, res: express.Response) {
  console.error('Unimplemented');
  return res.status(500).send(GENERIC_ERROR_MESSAGE);
}

export function modifyQuest(quest: Quest, req: express.Request, res: express.Response) {
  console.error('Unimplemented');
  return res.status(500).send(GENERIC_ERROR_MESSAGE);
}

export function queryUser(user: User, req: express.Request, res: express.Response) {
  console.error('Unimplemented');
  return res.status(500).send(GENERIC_ERROR_MESSAGE);
}

export function modifyUser(user: User, req: express.Request, res: express.Response) {
  console.error('Unimplemented');
  return res.status(500).send(GENERIC_ERROR_MESSAGE);
}
