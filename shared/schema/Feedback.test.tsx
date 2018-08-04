import {PRIVATE_PARTITION} from './Constants';
import {Feedback} from './Feedback';

describe('Feedback Schema', () => {
  const base = {partition: PRIVATE_PARTITION, questid: '12345', userid: '54321'};
  it('is invalid when missing partition, questid, or userid', () => {
    expect(Feedback.create({...base, userid: undefined}) instanceof Error).toEqual(true);
    expect(Feedback.create({...base, questid: undefined}) instanceof Error).toEqual(true);
    expect(Feedback.create({...base, partition: undefined}) instanceof Error).toEqual(true);
  });
  it('is valid when partition and IDs given', () => {
    const f = new Feedback(base);
    expect(f.partition).toEqual(base.partition);
    expect(f.questid).toEqual(base.questid);
    expect(f.userid).toEqual(base.userid);
  });
  it('rejects invalid difficulty', () => {
    expect(Feedback.create({...base, difficulty: 'Invalid'}) instanceof Error).toEqual(true);
  });
  it('accepts valid difficulty', () => {
    const f = new Feedback({...base, difficulty: 'HARD'});
    expect(f.difficulty).toEqual('HARD');
  });
  it('accepts quest line number', () => {
    const f = new Feedback({...base, questline: 10});
    expect(f.questline).toEqual(10);
  });
});
