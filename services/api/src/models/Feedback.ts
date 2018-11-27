import * as Promise from 'bluebird';
import {Feedback} from 'shared/schema/Feedback';
import {Quest} from 'shared/schema/Quests';
import {PLACEHOLDER_DATE} from 'shared/schema/SchemaBase';
import {MailService} from '../Mail';
import {Database, FeedbackInstance, QuestInstance} from './Database';
import {getQuest, updateQuestRatings} from './Quests';
import {prepare} from './Schema';

export const FabricateFeedbackEmail = 'expedition+feedback@fabricate.io';
export const FabricateReportQuestEmail = 'expedition+apperror@fabricate.io';
export const FabricateQuestFeedbackEmail = 'expedition+questfeedback@fabricate.io';

export type FeedbackType = 'feedback'|'rating'|'report_error'|'report_quest';

export function getFeedback(db: Database, partition: string, questid: string, userid: string): Promise<FeedbackInstance|null> {
  return db.feedback.findOne({where: {partition, questid, userid}});
}

export function getFeedbackByQuestId(db: Database, partition: string, questid: string): Promise<FeedbackInstance[]> {
  return db.feedback.findAll({where: {partition, questid, rating: {$gt: 0}}});
}

function mailFeedbackToAdmin(mail: MailService, type: FeedbackType, quest: Quest|null, feedback: Feedback, platformDump: string, consoleDump: string[]) {
  const subject = `Feedback (${feedback.platform} v${feedback.version})`;
  let message = `
    <p>Feedback type: ${type}</p>
    <p></p>
    <p>Message: <em>${feedback.text}</em></p>
    <p></p>
  `;

  if (quest !== null) {
    message += `
      <p>Quest: ${quest.title}</p>
      <p>Author email: <a href="mailto:${quest.email}">${quest.email}</a></p>
      <p>Quest creator link: <a href="https://quests.expeditiongame.com/#${feedback.questid}">https://quests.expeditiongame.com/#${feedback.questid}</a></p>
    `;
    if (feedback.questline > 0) {
      message += `<p>Quest Line #: ${feedback.questline}</p>`;
    }
  } else {
    message += `<p>Could not resolve published quest details for this feedback.</p>`;
  }

  message += `
    <p>User settings: ${feedback.players} adventurers on ${feedback.difficulty} difficulty.</p>
    <p>Raw platform string: ${platformDump}</p>
    <p>User email that reported it: <a href="mailto:${feedback.email}">${feedback.email}</a></p>
    <p>Multiplayer stats: ${feedback.stats}</p>
  `;

  if (consoleDump.length > 0) {
    message += `<p>Console log record:</p>
      <pre>${consoleDump.join('\n')}</pre>
    `;
  }

  // We do NOT send non-review feedback to authors - it's typically less actionable
  // so we'd likely need to do some initial triage.
  const to = [FabricateFeedbackEmail];
  return mail.send(to, subject, message);
}

function mailFeedbackThanksToUser(mail: MailService, feedback: Feedback) {
  const subject = `Expedition: thanks for your feedback!`;
  const message = `<p>We've received your feedback, and we'll respond back if we have any additional questions.</p>
  <p>For your own records, here's what you wrote:</p>
  <p></p>
  <p><em>${feedback.text}</em></p>
  <p></p>
  <p>Thanks again for taking the time to let us know how to improve Expedition! If you have any additional feedback
  or want to clarify any details, respond to this email or use the Feedback button in the app.</p>
  <p></p>
  <p>The Expedition Team</p>
  <p>expedition@fabricate.io</p>`;
  const to = [feedback.email];
  // Don't send a copy to admin email as we send another email instead
  return mail.send(to, subject, message, false);
}

export function submitFeedback(db: Database, mail: MailService, type: FeedbackType, feedback: Feedback, platformDump: string, consoleDump: string[]): Promise<any> {
  return Promise.resolve()
    .then(() => {
      if (feedback.partition && feedback.questid) {
        return getQuest(db, feedback.partition, feedback.questid);
      }
      return null as any;
    })
    .then((q: Quest|null) => {
      return mailFeedbackToAdmin(mail, type, q, feedback, platformDump, consoleDump);
    })
    .then(() => {
      if (!feedback.email) {
        return;
      }
      return mailFeedbackThanksToUser(mail, feedback);
    });
}

function mailFirstRating(mail: MailService, feedback: Feedback, quest: Quest) {
  const emails = [];
  if (quest.email) {
    emails.push(quest.email);
  }
  if (!feedback.rating || feedback.rating <= 3) {
    emails.push(FabricateQuestFeedbackEmail);
  }
  const subject = `Your quest just received its first rating!`;
  let message = `<p>${quest.author},</p>
    <p>Your quest, ${quest.title}, just received its first rating!</p>
    <p>${feedback.rating} out of 5 stars.</p>
  `;
  if (feedback.text && feedback.text.length > 0) {
    message += `<p>User feedback:</p><p>"${feedback.text}"</p>`;
  }
  if (feedback.email && !feedback.anonymous) {
    message += `<p>Reviewer email: <a href="mailto:${feedback.email}">${feedback.email}</a></p>`;
  }
  message += `<p>Link to edit quest: <a href="https://quests.expeditiongame.com/#${feedback.questid}">https://quests.expeditiongame.com/#${feedback.questid}</a></p>`;
  return mail.send(emails, subject, message);
}

function mailNewRating(mail: MailService, feedback: Feedback, quest: Quest) {
  const emails = [];
  if (quest.email) {
    emails.push(quest.email);
  }
  if (!feedback.rating || feedback.rating <= 3) {
    emails.push(FabricateQuestFeedbackEmail);
  }
  const subject = `Quest rated ${feedback.rating}/5: ${quest.title}`;
  let message = `<p>User feedback:</p>
    <p>"${feedback.text}"</p>
    <p>${feedback.rating} out of 5 stars</p>
    <p>New quest overall rating: ${quest.ratingavg.toFixed(1)} out of 5 across ${quest.ratingcount} ratings.</p>
    <p>Was submitted for ${quest.title} by ${quest.author}</p>
    <p>They played with ${feedback.players} adventurers on ${feedback.difficulty} difficulty on ${feedback.platform} v${feedback.version}.</p>
    <p>Link to edit quest: <a href="https://quests.expeditiongame.com/#${feedback.questid}">https://quests.expeditiongame.com/#${feedback.questid}</a></p>
  `;
  if (feedback.email && !feedback.anonymous) {
    message += `<p>Reviewer email: <a href="mailto:${feedback.email}">${feedback.email}</a></p>`;
  }
  return mail.send(emails, subject, message);
}

export function submitRating(db: Database, mail: MailService, feedback: Feedback): Promise<any> {
  return getQuest(db, feedback.partition, feedback.questid)
    .catch((e: Error) => {
      throw new Error('no such quest');
    })
    .then((quest: Quest) => {
      feedback.questversion = quest.questversion;
      return db.feedback.upsert(prepare(feedback));
    })
    .then((created: boolean) => updateQuestRatings(db, feedback.partition, feedback.questid))
    .then((questInstance: QuestInstance) => {
      const quest = new Quest(questInstance.dataValues);
      if (quest.ratingcount === 1) {
        mailFirstRating(mail, feedback, quest);
      } else if (feedback.text && feedback.text.length > 0 && !feedback.text.endsWith('Details: --')) {
        // New high quest ratings end with "Details: --" when no details are given.
        mailNewRating(mail, feedback, quest);
      }
    });
}

export function suppressFeedback(db: Database, partition: string, questid: string, userid: string, suppress: boolean): Promise<any> {
  return db.feedback.update({tombstone: (suppress) ? new Date() : PLACEHOLDER_DATE} as any, {where: {partition, questid, userid}, limit: 1})
    .then(() => {
      return updateQuestRatings(db, partition, questid);
    });
}

function mailReportToAdmin(mail: MailService, feedback: Feedback, quest: Quest, platformDump: string) {
  const subject = `Quest reported: ${quest.title}`;
  let message = `<p>Message: ${feedback.text}</p>
    <p>They played with ${feedback.players} adventurers on ${feedback.difficulty} difficulty on ${feedback.platform} v${feedback.version}.</p>
    <p>Raw platform string: ${platformDump}</p>
    <p>User email that reported it: <a href="mailto:${feedback.email}">${feedback.email}</a></p>
    <p>Link to edit quest: <a href="https://quests.expeditiongame.com/#${feedback.questid}">https://quests.expeditiongame.com/#${feedback.questid}</a></p>
  `;
  if (feedback.questline > 0) {
    message += `<p>Quest Line #: ${feedback.questline}</p>`;
  }
  // Do NOT include quest author when user reports a quest.
  const to = [FabricateReportQuestEmail];
  return mail.send(to, subject, message);
}

export function submitReportQuest(db: Database, mail: MailService, feedback: Feedback, platformDump: string): Promise<any> {
  return getQuest(db, feedback.partition, feedback.questid)
    .then((quest: Quest) => {
      return mailReportToAdmin(mail, feedback, quest, platformDump);
    });
}
