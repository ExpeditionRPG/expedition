import { mockReq, mockRes } from 'sinon-express-mock';
import {
  feedback as f,
  quests as q,
  users as u,
  testingDBWithState,
} from '../models/TestData';
import {
  queryFeedback,
  modifyFeedback,
  queryQuest,
  modifyQuest,
  queryUser,
  modifyUser,
  recalculateRatings,
} from './Handlers';

describe('handlers', () => {
  test('reports rating recalculation database failures', async () => {
    const db = await testingDBWithState([]);
    const failure = new Error('Ratings query failed');
    const logged = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(db.quests, 'findAll').mockRejectedValueOnce(failure);
    const res = mockRes();
    try {
      await recalculateRatings(db, mockReq(), res);
      expect(res.status.calledWith(500)).toEqual(true);
      expect(
        res.send.calledWith(
          JSON.stringify({
            status: 'ERROR',
            error: String(failure),
          }),
        ),
      ).toEqual(true);
      expect(logged).toHaveBeenCalledWith(failure);
    } finally {
      await db.sequelize.close();
    }
  });
  describe('feedback', () => {
    test('can be queried', async () => {
      const db = await testingDBWithState([q.basic, f.rating]);
      const res = mockRes();
      await queryFeedback(
        db,
        mockReq({ body: JSON.stringify({ questid: q.basic.id }) }),
        res,
      );
      expect(res.status.calledWith(200)).toBe(true);
      expect(JSON.parse(res.send.firstCall.args[0])[0]).toMatchObject({
        quest: { id: q.basic.id },
        rating: f.rating.rating,
      });
    });
    test('can be modified', async () => {
      const db = await testingDBWithState([q.basic, f.rating]);
      const res = mockRes();
      await modifyFeedback(
        db,
        mockReq({
          body: JSON.stringify({
            partition: f.rating.partition,
            questid: f.rating.questid,
            userid: f.rating.userid,
            suppress: true,
          }),
        }),
        res,
      );
      expect(res.status.calledWith(200)).toBe(true);
      const row = await db.feedback.findOne();
      expect(row!.get('tombstone').getTime()).toBeGreaterThan(0);
    });
  });
  describe('quests', () => {
    test('can be queried', async () => {
      const db = await testingDBWithState([q.basic]);
      const res = mockRes();
      await queryQuest(
        db,
        mockReq({ body: JSON.stringify({ questid: q.basic.id }) }),
        res,
      );
      expect(res.status.calledWith(200)).toBe(true);
      expect(JSON.parse(res.send.firstCall.args[0])[0]).toMatchObject({
        id: q.basic.id,
        title: q.basic.title,
      });
    });
    test('can be modified', async () => {
      const db = await testingDBWithState([q.basic]);
      const res = mockRes();
      await modifyQuest(
        db,
        mockReq({
          body: JSON.stringify({
            partition: q.basic.partition,
            questid: q.basic.id,
            published: false,
          }),
        }),
        res,
      );
      expect(res.status.calledWith(200)).toBe(true);
      const row = await db.quests.findOne();
      expect(row!.get('tombstone').getTime()).toBeGreaterThan(0);
    });
  });
  describe('users', () => {
    test('can be queried', async () => {
      const db = await testingDBWithState([u.basic]);
      const res = mockRes();
      await queryUser(
        db,
        mockReq({ body: JSON.stringify({ userid: u.basic.id }) }),
        res,
      );
      expect(res.status.calledWith(200)).toBe(true);
      expect(JSON.parse(res.send.firstCall.args[0])).toEqual([
        expect.objectContaining({ id: u.basic.id, email: u.basic.email }),
      ]);
    });
    test('can be modified', async () => {
      const db = await testingDBWithState([u.basic]);
      for (const points of [123, 0]) {
        const res = mockRes();
        await modifyUser(
          db,
          mockReq({
            body: JSON.stringify({ userid: u.basic.id, loot_points: points }),
          }),
          res,
        );
        expect(res.status.calledWith(200)).toBe(true);
        const row = await db.users.findOne();
        expect(row!.get('lootPoints')).toBe(points);
      }
    });
  });
});
