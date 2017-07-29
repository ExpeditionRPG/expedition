import {ParserNode} from './Node'
import {QuestContext} from '../reducers/QuestTypes'
import {defaultQuestContext} from '../reducers/Quest'
declare var global: any;

const cheerio = require('cheerio') as CheerioAPI;
const window: any = cheerio.load('<div>');

describe('Node', () => {
  describe('getNext', () => {
    it('returns next node if enabled', () => {
      const quest = cheerio.load('<quest><roleplay></roleplay><roleplay if="asdf">expected</roleplay><roleplay>wrong</roleplay></quest>')('quest');
      const ctx = defaultQuestContext();
      ctx.scope.asdf = true;
      const pnode = new ParserNode(quest.children().eq(0), ctx);
      expect(pnode.getNext().elem.text()).toEqual('expected');
    });
    it('skips disabled elements', () => {
      const quest = cheerio.load('<quest><roleplay></roleplay><roleplay if="asdf">wrong</roleplay><roleplay>expected</roleplay></quest>')('quest');
      const pnode = new ParserNode(quest.children().eq(0), defaultQuestContext());
      expect(pnode.getNext().elem.text()).toEqual('expected');
    });
    it('returns null if no next element', () => {
      const pnode = new ParserNode(cheerio.load('<roleplay></roleplay>')('roleplay'), defaultQuestContext());
      expect(pnode.getNext()).toEqual(null);
    });
    it('returns next node if choice=0 and no choice', () => {
      const quest = cheerio.load('<quest><roleplay></roleplay><roleplay>expected</roleplay></quest>')('quest');
      const pnode = new ParserNode(quest.children().eq(0), defaultQuestContext());
      expect(pnode.getNext(0).elem.text()).toEqual('expected');
    });
    it('returns node given by choice index', () => {
      const quest = cheerio.load('<quest><roleplay><choice></choice><choice if="asdf"></choice><choice><roleplay>expected</roleplay><roleplay>wrong</roleplay></choice></roleplay></quest>')('quest');
      const pnode = new ParserNode(quest.children().eq(0), defaultQuestContext());
      expect(pnode.getNext(1).elem.text()).toEqual('expected');
    });
    it('returns node given by event name', () => {
      const quest = cheerio.load('<quest><roleplay><event></event><choice></choice><event on="test"><roleplay>expected</roleplay><roleplay>wrong</roleplay></event></roleplay></quest>')('quest');
      const pnode = new ParserNode(quest.children().eq(0), defaultQuestContext());
      expect(pnode.getNext('test').elem.text()).toEqual('expected');
    });
  });

  describe('getVisibleKeys', () => {
    it('shows events', () => {
      const pnode = new ParserNode(cheerio.load('<combat><event on="win"></event><event if="true" on="lose"></event></combat>')('combat'), defaultQuestContext());
      expect (pnode.getVisibleKeys()).toEqual(['win', 'lose']);
    });
    it('shows choices', () => {
      const pnode = new ParserNode(cheerio.load('<roleplay><choice text="a"></choice><choice if="true" text="b"></choice></roleplay>')('roleplay'), defaultQuestContext());
      expect (pnode.getVisibleKeys()).toEqual([0, 1]);
    });
    it('hides conditionally false events', () => {
      const pnode = new ParserNode(cheerio.load('<combat><event if="false" on="win"></event><event on="lose"></event></combat>')('combat'), defaultQuestContext());
      expect (pnode.getVisibleKeys()).toEqual(['lose']);
    });
    it('hides conditionally false choices', () => {
      const pnode = new ParserNode(cheerio.load('<roleplay><choice text="a" if="false"></choice><choice text="b"></choice></roleplay>')('roleplay'), defaultQuestContext());
      expect (pnode.getVisibleKeys()).toEqual([0]);
    });
    it('is empty when no choices/events', () => {
      const pnode = new ParserNode(cheerio.load('<roleplay></roleplay>')('roleplay'), defaultQuestContext());
      expect (pnode.getVisibleKeys()).toEqual([]);
    });
  });

  describe('getTag', () => {
    it('gets the tag', () => {
      expect(new ParserNode(cheerio.load('<roleplay></roleplay>')('roleplay'), defaultQuestContext()).getTag()).toEqual('roleplay');
      expect(new ParserNode(cheerio.load('<combat></combat>')('combat'), defaultQuestContext()).getTag()).toEqual('combat');
    });
  })

  describe('gotoId', () => {
    it('goes to ID', () => {
      const quest = cheerio.load('<quest><roleplay></roleplay><roleplay>wrong</roleplay><roleplay id="test">expected</roleplay></quest>')('quest');
      const pnode = new ParserNode(quest.children().eq(0), defaultQuestContext());
      expect(pnode.gotoId('test').elem.text()).toEqual('expected');
    });
    it('returns null if ID does not exist', () => {
      const quest = cheerio.load('<quest><roleplay>wrong</roleplay></quest>')('quest');
      const pnode = new ParserNode(quest.children().eq(0), defaultQuestContext());
      expect(pnode.gotoId('test')).toEqual(null);
    });
    it('returns null when no <quest> tag', () => {
      const pnode = new ParserNode(cheerio.load('<roleplay><choice><roleplay id="test">wrong</roleplay></choice></roleplay>')('#test').eq(0), defaultQuestContext());
      expect(pnode.gotoId('test')).toEqual(null);
    });
    it('safely handles multiple identical ids', () => {
      const quest = cheerio.load('<quest><roleplay></roleplay><roleplay id="test">expected</roleplay><roleplay id="test">expected</roleplay></quest>')('quest');
      const pnode = new ParserNode(quest.children().eq(0), defaultQuestContext());
      expect(pnode.gotoId('test').elem.text()).toEqual('expected');
    });
  });

  describe('loopChildren', () => {
    it('handles empty case', () => {
      const pnode = new ParserNode(cheerio.load('<roleplay></roleplay>')('roleplay'), defaultQuestContext());
      const sawChild = pnode.loopChildren((tag, c) => { return true; }) || false;
      expect(sawChild).toEqual(false);
    })
    it('loops only enabled children', () => {
      const pnode = new ParserNode(cheerio.load('<roleplay><p>1</p><b>2</b><p if="a">3</p><i>4</i></roleplay>')('roleplay'), defaultQuestContext());
      const agg: any[] = [];
      const result = pnode.loopChildren((tag, c) => {
        agg.push(tag);
      });
      expect(result).toEqual(undefined);
      expect(agg).toEqual(['p', 'b', 'i']);
    });
    it('stops early when a value is returned', () => {
      const pnode = new ParserNode(cheerio.load('<roleplay><p>1</p><b>2</b><p if="a">3</p><i>4</i></roleplay>')('roleplay'), defaultQuestContext());
      const result = pnode.loopChildren((tag, c) => {
        if (c.text() === '2') {
          return tag;
        }
      });
      expect(result).toEqual('b');
    });
  });

  describe('rendering', () => {
    const renderedChildren = function(elem: Cheerio, ctx: QuestContext): string[] {
      const result: string[] = [];
      new ParserNode(elem, ctx).loopChildren((tag, c) => {
        result.push(c.toString());
      });
      return result;
    }

    it('hides children with nothing but variable assignment', () => {
      // Lines with nothing but variable assignment are hidden
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{text="TEST"}}</p><p>{{text}}</p></roleplay>')('roleplay'),
        defaultQuestContext())
      ).toEqual(['<p>TEST</p>']);
    });

    it('hides children conditionally', () => {
      // Unassigned
      expect(renderedChildren(
        cheerio.load('<roleplay><choice if="a" text="Hidden"></choice></roleplay>')('roleplay'),
        defaultQuestContext())
      ).toEqual([]);

      // False
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{a=false}}</p><choice if="a" text="Hidden"></choice></roleplay>')('roleplay'),
        defaultQuestContext()
      )).toEqual([]);

      // False - multiple conditions
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{a=false}}{{b=true}}</p><choice if="a & b" text="Hidden"></choice></roleplay>')('roleplay'),
        defaultQuestContext()
      )).toEqual([]);

      // Zero
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{a=0}}</p><choice if="a" text="Hidden"></choice></roleplay>')('roleplay'),
        defaultQuestContext()
      )).toEqual([]);
    });

    it('shows children conditionally', () => {
      // True
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{a=true}}</p><choice if="a" text="Visible"></choice></roleplay>')('roleplay'),
        defaultQuestContext()
      )).toEqual(['<choice if="a" text="Visible"></choice>']);

      // True - multiple conditions
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{a=true}}{{b=true}}</p><choice if="a & b" text="Visible"></choice></roleplay>')('roleplay'),
        defaultQuestContext()
      )).toEqual(['<choice if="a &amp; b" text="Visible"></choice>']);

      // Non-zero
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{a=1}}</p><choice if="a" text="Visible"></choice></roleplay>')('roleplay'),
        defaultQuestContext()
      )).toEqual(['<choice if="a" text="Visible"></choice>']);
    });

    it('displays 0 and 1 properly', () => {
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{a=0}}{{b=1}}</p><p>{{a}}{{b}}</p></roleplay>')('roleplay'),
        defaultQuestContext()
      )).toEqual(['<p>01</p>']);
    });

    it('indirects single-valued array results', () => {
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{r=[5]}}</p><p>{{r}}</p></roleplay>')('roleplay'),
        defaultQuestContext()
      )).toEqual(['<p>5</p>']);
    })

    it('handles multiple ops on one line', () => {
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{text="TEST"}} {{r=[5]}}</p><p>{{text}}{{r}}</p></roleplay>')('roleplay'),
        defaultQuestContext()
      )).toEqual(['<p>TEST5</p>']);
    })

    it('parses ops in instruction nodes', () => {
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{num = 1}}</p><instruction>Hey {{num}}</instruction></roleplay>')('roleplay'),
        defaultQuestContext()
      )).toEqual(['<instruction>Hey 1</instruction>']);
    });

    it('parses ops in choice attribs', () => {
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{num=1}}</p><choice text="Hey {{num}}"></choice></roleplay>')('roleplay'),
        defaultQuestContext()
      )).toEqual(['<choice text="Hey 1"></choice>']);
    });

    it('parses multi-statement ops in body and respects newlines', () => {
      // If the op ends without an assignment, it's displayed. If it does, it's hidden.
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{a=5;c=7}}</p><p>{{b=7;a}}</p><p>{{a=5\nb=10}}</p><p>{{a=5\nb=10\nc}}</p></roleplay>')('roleplay'),
        defaultQuestContext()
      )).toEqual(['<p>5</p>', '<p>7</p>']);
    });

    it('increments scope._.views.<id>', () => {
      const ctx = defaultQuestContext();
      let result = new ParserNode(cheerio.load('<roleplay id="foo"><p>[roll]</p></roleplay>')('roleplay'), ctx);
      expect(result.ctx.views).toEqual({foo: 1});
      expect(result.ctx.scope._.viewCount('foo')).toEqual(1);
      expect(result.ctx.scope._.viewCount('bar')).toEqual(0);
      result = new ParserNode(cheerio.load('<roleplay id="foo"><p>[roll]</p></roleplay>')('roleplay'), result.ctx);
      expect(result.ctx.views).toEqual({foo: 2});
      expect(result.ctx.scope._.viewCount('foo')).toEqual(2);
      expect(result.ctx.scope._.viewCount('bar')).toEqual(0);
      result = new ParserNode(cheerio.load('<roleplay id="bar"><p>[roll]</p></roleplay>')('roleplay'), result.ctx);
      expect(result.ctx.views).toEqual({foo: 2, bar: 1});
      expect(result.ctx.scope._.viewCount('foo')).toEqual(2);
      expect(result.ctx.scope._.viewCount('bar')).toEqual(1);
    });
  });

  describe('getComparisonKey', () => {
    it('equates separate but identical contexts/node references', () => {
      const e1 = cheerio.load('<quest><roleplay><choice><combat data-line="110"></combat></choice></roleplay></quest>')('combat');
      const p1 = new ParserNode(e1, defaultQuestContext());

      const e2 = cheerio.load('<quest><roleplay><choice><combat data-line="110"></combat></choice></roleplay></quest>')('combat');
      const p2 = new ParserNode(e2, defaultQuestContext());

      expect(p1.getComparisonKey()).toEqual(p2.getComparisonKey());
    });

    it('treats different nodes as unequal', () => {
      const dom = cheerio.load('<quest><roleplay><choice><combat id="c1" data-line="110"></combat><combat id="c2" data-line="111"></combat></choice></roleplay></quest>');
      const e1 = dom('#c1');
      const p1 = new ParserNode(e1, defaultQuestContext());

      const e2 = dom('#c2');
      const p2 = new ParserNode(e2, defaultQuestContext());

      expect(p1.getComparisonKey()).not.toEqual(p2.getComparisonKey());
    });

    it('treats different contexts as unequal', () => {
      const e = cheerio.load('<quest>')('quest');
      const c1 = defaultQuestContext();
      c1.scope.a = 'test';
      const p1 = new ParserNode(e, c1);

      const c2 = defaultQuestContext();
      c2.scope.a = 5;
      const p2 = new ParserNode(e, c2);

      expect(p1.getComparisonKey()).not.toEqual(p2.getComparisonKey());
    })

    it('safely handles lack of quest root', () => {
      const e1 = cheerio.load('<roleplay><choice><combat data-line="110"></combat></choice></roleplay>')('combat');
      const p1 = new ParserNode(e1, defaultQuestContext());

      expect(p1.getComparisonKey()).toBeDefined();
    });
  });
});
