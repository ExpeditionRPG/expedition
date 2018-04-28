import {Quest} from './Quests'
import {PUBLIC_PARTITION, PRIVATE_PARTITION} from './Constants'

describe('Quests Schema', () => {
  const base = {partition: PRIVATE_PARTITION, id: '12345'};
  it('is invalid when no partition or id', () => {
    expect(Quest.create({partition: PUBLIC_PARTITION}) instanceof Error).toEqual(true);
    expect(Quest.create({id: ''}) instanceof Error).toEqual(true);
  });
  it('is valid when partition and ID given', () => {
    const q = new Quest(base);
    expect(q.partition).toEqual('expedition-private');
    expect(q.id).toEqual('12345');
  });
  it('rejects invalid genre', () => {
    expect(Quest.create({...base, genre: 'Invalid'}) instanceof Error).toEqual(true);
  });
  it('rejects invalid content rating', () => {
    expect(Quest.create({...base, contentrating: 'Invalid'}) instanceof Error).toEqual(true);
  });
  it('rejects invalid language', () => {
    expect(Quest.create({...base, language: 'Invalid'}) instanceof Error).toEqual(true);
  });
  it('accepts valid genre, content rating, and language', () => {
    new Quest({
      partition: PRIVATE_PARTITION,
      id: '12345',
      genre: 'Horror',
      contentrating: 'Adult',
      language: 'English',
    });
  });
})
