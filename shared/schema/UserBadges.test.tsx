import {UserBadge} from './UserBadges';

describe('UserBadge Schema', () => {
  const base = {userid: '54321', badge: 'backer1'};
  test('is invalid when missing userid', () => {
    expect(UserBadge.create({badge: 'backer1'}) instanceof Error).toEqual(true);
  });
  test('is valid when id given', () => {
    const f = new UserBadge(base);
    expect(f.id).toEqual(base.id);
  });
});
