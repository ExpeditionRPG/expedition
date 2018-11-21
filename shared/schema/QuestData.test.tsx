import {PRIVATE_PARTITION, PUBLIC_PARTITION} from './Constants';
import {QuestData} from './QuestData';

describe('QuestData Schema', () => {
  const base = {id: '12345', created: new Date(), userid: '8960', data: 'test text', notes: 'test notes', metadata: JSON.stringify({'a': 5})};
  test('is invalid when no id', () => {
    expect(QuestData.create({id: ''}) instanceof Error).toEqual(true);
  });
  test('is valid id, user, and creation date', () => {
    const q = new QuestData(base);
    expect(q.id).toEqual('12345');
  });
});
