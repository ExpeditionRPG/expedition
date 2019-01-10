import {Partition} from './Constants';
import {Feedback} from './Feedback';

describe('Feedback Schema', () => {
  const base = {partition: Partition.expeditionPrivate, questid: '12345', userid: '54321'};
  test('is invalid when missing partition, questid, or userid', () => {
    expect(Feedback.create({...base, userid: undefined}) instanceof Error).toEqual(true);
    expect(Feedback.create({...base, questid: undefined}) instanceof Error).toEqual(true);
    expect(Feedback.create({...base, partition: undefined}) instanceof Error).toEqual(true);
  });
  test('is valid when partition and IDs given', () => {
    const f = new Feedback(base);
    expect(f.partition).toEqual(base.partition);
    expect(f.questid).toEqual(base.questid);
    expect(f.userid).toEqual(base.userid);
  });
  test('rejects invalid difficulty', () => {
    expect(Feedback.create({...base, difficulty: 'Invalid'}) instanceof Error).toEqual(true);
  });
  test('accepts valid difficulty', () => {
    const f = new Feedback({...base, difficulty: 'HARD'});
    expect(f.difficulty).toEqual('HARD');
  });
  test('accepts quest line number', () => {
    const f = new Feedback({...base, questline: 10});
    expect(f.questline).toEqual(10);
  });
});
