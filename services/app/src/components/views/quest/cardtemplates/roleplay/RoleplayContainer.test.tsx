import combinedReduce from 'app/reducers/CombinedReducers';
import { AppStateBase } from 'app/reducers/StateTypes';
import * as cheerio from 'shared/Cheerio';
import { defaultContext } from '../Template';
import { ParserNode } from '../TemplateTypes';
import { mapStateToProps } from './RoleplayContainer';

describe('RoleplayContainer', () => {
  test('uses the immediately preceding defeated combat for retry', () => {
    const initial = combinedReduce(undefined, { type: 'INIT' });
    const alive = new ParserNode(
      cheerio.load('<combat/>')('combat'),
      defaultContext(),
    );
    const defeated = new ParserNode(
      cheerio.load('<combat/>')('combat'),
      defaultContext(),
    );
    alive.ctx.templates.combat.numAliveAdventurers = 1;
    defeated.ctx.templates.combat.numAliveAdventurers = 0;
    const roleplay = new ParserNode(
      cheerio.load('<roleplay><p>Defeated.</p></roleplay>')('roleplay'),
      defaultContext(),
    );
    const snapshot = (node: ParserNode): AppStateBase => ({
      ...initial,
      quest: { ...initial.quest, node },
    });
    const state = {
      ...initial,
      quest: { ...initial.quest, node: roleplay },
      _history: [snapshot(alive), snapshot(defeated)],
    };
    expect(mapStateToProps(state, { node: roleplay }).prevNode).toBe(defeated);
  });
});
