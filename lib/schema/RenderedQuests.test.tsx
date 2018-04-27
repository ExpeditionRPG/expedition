import {RenderedQuest} from './RenderedQuests'
import {PRIVATE_PARTITION} from './Quests'

describe('RenderedQuest Schema', () => {
  const base = {id: '54321', partition:  PRIVATE_PARTITION};
  it('is invalid when missing id or partition', () => {
    expect(RenderedQuest.create({...base, id: undefined}) instanceof Error).toEqual(true);
    expect(RenderedQuest.create({...base, partition: undefined}) instanceof Error).toEqual(true);
  });
  it('is valid when id and partition given', () => {
    const f = new RenderedQuest(base);
    expect(f.id).toEqual(base.id);
    expect(f.partition).toEqual(base.partition);
  });
})
