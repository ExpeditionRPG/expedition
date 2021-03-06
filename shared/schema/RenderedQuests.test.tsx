import {Partition} from './Constants';
import {RenderedQuest} from './RenderedQuests';

describe('RenderedQuest Schema', () => {
  const base = {id: '54321', partition:  Partition.expeditionPrivate};
  test('is invalid when missing id or partition', () => {
    expect(RenderedQuest.create({...base, id: undefined}) instanceof Error).toEqual(true);
    expect(RenderedQuest.create({...base, partition: undefined}) instanceof Error).toEqual(true);
  });
  test('is valid when id and partition given', () => {
    const f = new RenderedQuest(base);
    expect(f.id).toEqual(base.id);
    expect(f.partition).toEqual(base.partition);
  });
});
