import { mockReq, mockRes } from 'sinon-express-mock';
import { testingDBWithState } from '../models/TestData';
import { recalculateRatings } from './Handlers';

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
    test.skip('can be queried', () => {
      /* TODO */
    });
    test.skip('can be modified', () => {
      /* TODO */
    });
  });
  describe('quests', () => {
    test.skip('can be queried', () => {
      /* TODO */
    });
    test.skip('can be modified', () => {
      /* TODO */
    });
  });
  describe('users', () => {
    test.skip('can be queried', () => {
      /* TODO */
    });
    test.skip('can be modified', () => {
      /* TODO */
    });
  });
});
