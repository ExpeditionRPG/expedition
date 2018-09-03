import {PRIVATE_PARTITION, PUBLIC_PARTITION} from './Constants';
import {Quest} from './Quests';

describe('Quests Schema', () => {
  const base = {partition: PRIVATE_PARTITION, id: '12345'};
  test('is invalid when no partition or id', () => {
    expect(Quest.create({partition: PUBLIC_PARTITION}) instanceof Error).toEqual(true);
    expect(Quest.create({id: ''}) instanceof Error).toEqual(true);
  });
  test('is valid when partition and ID given', () => {
    const q = new Quest(base);
    expect(q.partition).toEqual('expedition-private');
    expect(q.id).toEqual('12345');
  });
  test('rejects invalid genre', () => {
    expect(Quest.create({...base, genre: 'Invalid'}) instanceof Error).toEqual(true);
  });
  test('rejects invalid content rating', () => {
    expect(Quest.create({...base, contentrating: 'Invalid'}) instanceof Error).toEqual(true);
  });
  test('rejects invalid language', () => {
    expect(Quest.create({...base, language: 'Invalid'}) instanceof Error).toEqual(true);
  });
  test('accepts valid genre, content rating, language and theme', () => {
    const q = new Quest({
      contentrating: 'Adult',
      genre: 'Horror',
      id: '12345',
      language: 'English',
      partition: PRIVATE_PARTITION,
      theme: 'base',
    });
    expect(q.contentrating).toEqual('Adult');
    expect(q.genre).toEqual('Horror');
    expect(q.language).toEqual('English');
    expect(q.theme).toEqual('base');
  });
});
