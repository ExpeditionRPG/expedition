import { mockReq, mockRes } from 'sinon-express-mock';
import { UserQuery, UserEntry } from './QueryTypes';
import { queryUser } from './Handlers';
import { testingDBWithState, users } from '../models/TestData';
test('typed admin queries round-trip through the JSON API response contract', async () => {
  const query: UserQuery = {
    userid: users.basic.id,
    order: { column: 'id', ascending: true },
  };
  const db = await testingDBWithState([users.basic]);
  const res = mockRes();
  await queryUser(db, mockReq({ body: JSON.stringify(query) }), res);
  const entries: UserEntry[] = JSON.parse(res.send.firstCall.args[0]);
  expect(entries).toEqual([
    expect.objectContaining({ id: users.basic.id, loot_points: 0 }),
  ]);
});
