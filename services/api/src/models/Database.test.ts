import { testingDBWithState, users, quests, sessions } from './TestData';
test('initializes schema-backed database models and persists independent entities', async () => {
  const db = await testingDBWithState([
    users.basic,
    quests.basic,
    sessions.basic,
  ]);
  expect((await db.users.findByPk(users.basic.id))!.get('email')).toBe(
    users.basic.email,
  );
  expect((await db.quests.findOne())!.get('title')).toBe(quests.basic.title);
  expect(
    (await db.sessions.findByPk(sessions.basic.id))!.get('eventCounter'),
  ).toBe(0);
  await db.sequelize.close();
});
