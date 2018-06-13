import {Node} from './Node'
import {Context, defaultContext} from './Context'
declare var global: any;

const cheerio = require('cheerio') as CheerioAPI;

describe('Node', () => {
  describe('getNext', () => {
    it('returns next node if enabled', () => {
      const quest = cheerio.load('<quest><roleplay></roleplay><roleplay if="asdf">expected</roleplay><roleplay>wrong</roleplay></quest>')('quest');
      const ctx = defaultContext();
      ctx.scope.asdf = true;
      const pnode = new Node(quest.children().eq(0), ctx);
      const next = pnode.getNext();
      if (next === null) {
        throw new Error('getNext returned null node');
      }
      expect(next.elem.text()).toEqual('expected');
    });
    it('skips disabled elements', () => {
      const quest = cheerio.load('<quest><roleplay></roleplay><roleplay if="asdf">wrong</roleplay><roleplay>expected</roleplay></quest>')('quest');
      const pnode = new Node(quest.children().eq(0), defaultContext());
      const next = pnode.getNext();
      if (next === null) {
        throw new Error('getNext returned null node');
      }
      expect(next.elem.text()).toEqual('expected');
    });
    it('returns null if no next element', () => {
      const pnode = new Node(cheerio.load('<roleplay></roleplay>')('roleplay'), defaultContext());
      expect(pnode.getNext()).toEqual(null);
    });
    it('returns next node if choice=0 and no choice', () => {
      const quest = cheerio.load('<quest><roleplay></roleplay><roleplay>expected</roleplay></quest>')('quest');
      const pnode = new Node(quest.children().eq(0), defaultContext());
      const next = pnode.getNext(0);
      if (next === null) {
        throw new Error('getNext returned null node');
      }
      expect(next.elem.text()).toEqual('expected');
    });
    it('returns node given by choice index', () => {
      const quest = cheerio.load('<quest><roleplay><choice></choice><choice if="asdf"></choice><choice><roleplay>expected</roleplay><roleplay>wrong</roleplay></choice></roleplay></quest>')('quest');
      const pnode = new Node(quest.children().eq(0), defaultContext());
      const next = pnode.getNext(1);
      if (next === null) {
        throw new Error('getNext returned null node');
      }
      expect(next.elem.text()).toEqual('expected');
    });
    it('returns node given by event name', () => {
      const quest = cheerio.load('<quest><roleplay><event></event><choice></choice><event on="test"><roleplay>expected</roleplay><roleplay>wrong</roleplay></event></roleplay></quest>')('quest');
      const pnode = new Node(quest.children().eq(0), defaultContext());
      const next = pnode.getNext('test');
      if (next === null) {
        throw new Error('getNext returned null node');
      }
      expect(next.elem.text()).toEqual('expected');
    });
  });

  describe('getVisibleKeys', () => {
    it('shows events', () => {
      const pnode = new Node(cheerio.load('<combat><event on="win"></event><event if="true" on="lose"></event></combat>')('combat'), defaultContext());
      expect (pnode.getVisibleKeys()).toEqual(['win', 'lose']);
    });
    it('shows choices', () => {
      const pnode = new Node(cheerio.load('<roleplay><choice text="a"></choice><choice if="true" text="b"></choice></roleplay>')('roleplay'), defaultContext());
      expect (pnode.getVisibleKeys()).toEqual([0, 1]);
    });
    it('hides conditionally false events', () => {
      const pnode = new Node(cheerio.load('<combat><event if="false" on="win"></event><event on="lose"></event></combat>')('combat'), defaultContext());
      expect (pnode.getVisibleKeys()).toEqual(['lose']);
    });
    it('hides conditionally false choices', () => {
      const pnode = new Node(cheerio.load('<roleplay><choice text="a" if="false"></choice><choice text="b"></choice></roleplay>')('roleplay'), defaultContext());
      expect (pnode.getVisibleKeys()).toEqual([0]);
    });
    it('is empty when no choices/events', () => {
      const pnode = new Node(cheerio.load('<roleplay></roleplay>')('roleplay'), defaultContext());
      expect (pnode.getVisibleKeys()).toEqual([]);
    });
  });

  describe('getTag', () => {
    it('gets the tag', () => {
      expect(new Node(cheerio.load('<roleplay></roleplay>')('roleplay'), defaultContext()).getTag()).toEqual('roleplay');
      expect(new Node(cheerio.load('<combat></combat>')('combat'), defaultContext()).getTag()).toEqual('combat');
    });
  })

  describe('gotoId', () => {
    it('goes to ID', () => {
      const quest = cheerio.load('<quest><roleplay></roleplay><roleplay>wrong</roleplay><roleplay id="test">expected</roleplay></quest>')('quest');
      const pnode = new Node(quest.children().eq(0), defaultContext());
      const next = pnode.gotoId('test');
      if (next === null) {
        throw new Error('gotoID returned null node');
      }
      expect(next.elem.text()).toEqual('expected');
    });
    it('returns null if ID does not exist', () => {
      const quest = cheerio.load('<quest><roleplay>wrong</roleplay></quest>')('quest');
      const pnode = new Node(quest.children().eq(0), defaultContext());
      expect(pnode.gotoId('test')).toEqual(null);
    });
    it('returns null when no <quest> tag', () => {
      const pnode = new Node(cheerio.load('<roleplay><choice><roleplay id="test">wrong</roleplay></choice></roleplay>')('#test').eq(0), defaultContext());
      expect(pnode.gotoId('test')).toEqual(null);
    });
    it('safely handles multiple identical ids', () => {
      const quest = cheerio.load('<quest><roleplay></roleplay><roleplay id="test">expected</roleplay><roleplay id="test">expected</roleplay></quest>')('quest');
      const pnode = new Node(quest.children().eq(0), defaultContext());
      const next = pnode.gotoId('test');
      if (next === null) {
        throw new Error('gotoID returned null node');
      }
      expect(next.elem.text()).toEqual('expected');
    });
  });

  describe('loopChildren', () => {
    it('handles empty case', () => {
      const pnode = new Node(cheerio.load('<roleplay></roleplay>')('roleplay'), defaultContext());
      const sawChild = pnode.loopChildren((tag, c) => { return true; }) || false;
      expect(sawChild).toEqual(false);
    })
    it('loops only enabled children', () => {
      const pnode = new Node(cheerio.load('<roleplay><p>1</p><b>2</b><p if="a">3</p><i>4</i></roleplay>')('roleplay'), defaultContext());
      const agg: any[] = [];
      const result = pnode.loopChildren((tag, c) => {
        agg.push(tag);
      });
      expect(result).toEqual(undefined);
      expect(agg).toEqual(['p', 'b', 'i']);
    });
    it('stops early when a value is returned', () => {
      const pnode = new Node(cheerio.load('<roleplay><p>1</p><b>2</b><p if="a">3</p><i>4</i></roleplay>')('roleplay'), defaultContext());
      const result = pnode.loopChildren((tag, c) => {
        if (c.text() === '2') {
          return tag;
        }
      });
      expect(result).toEqual('b');
    });
  });

  describe('rendering', () => {
    const renderedChildren = function(elem: Cheerio, ctx: Context): string[] {
      const result: string[] = [];
      new Node(elem, ctx).loopChildren((tag, c) => {
        result.push(c.toString());
      });
      return result;
    }

    it('hides children with nothing but variable assignment', () => {
      // Lines with nothing but variable assignment are hidden
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{text="TEST"}}</p><p>{{text}}</p></roleplay>')('roleplay'),
        defaultContext())
      ).toEqual(['<p>TEST</p>']);
    });

    it('hides children conditionally', () => {
      // Unassigned
      expect(renderedChildren(
        cheerio.load('<roleplay><choice if="a" text="Hidden"></choice></roleplay>')('roleplay'),
        defaultContext())
      ).toEqual([]);

      // False
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{a=false}}</p><choice if="a" text="Hidden"></choice></roleplay>')('roleplay'),
        defaultContext()
      )).toEqual([]);

      // False - multiple conditions
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{a=false}}{{b=true}}</p><choice if="a & b" text="Hidden"></choice></roleplay>')('roleplay'),
        defaultContext()
      )).toEqual([]);

      // Zero
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{a=0}}</p><choice if="a" text="Hidden"></choice></roleplay>')('roleplay'),
        defaultContext()
      )).toEqual([]);
    });

    it('shows children conditionally', () => {
      // True
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{a=true}}</p><choice if="a" text="Visible"></choice></roleplay>')('roleplay'),
        defaultContext()
      )).toEqual(['<choice if="a" text="Visible"></choice>']);

      // True - multiple conditions
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{a=true}}{{b=true}}</p><choice if="a & b" text="Visible"></choice></roleplay>')('roleplay'),
        defaultContext()
      )).toEqual(['<choice if="a &amp; b" text="Visible"></choice>']);

      // Non-zero
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{a=1}}</p><choice if="a" text="Visible"></choice></roleplay>')('roleplay'),
        defaultContext()
      )).toEqual(['<choice if="a" text="Visible"></choice>']);
    });

    it('displays 0 and 1 properly', () => {
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{a=0}}{{b=1}}</p><p>{{a}}{{b}}</p></roleplay>')('roleplay'),
        defaultContext()
      )).toEqual(['<p>01</p>']);
    });

    it('indirects single-valued array results', () => {
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{r=[5]}}</p><p>{{r}}</p></roleplay>')('roleplay'),
        defaultContext()
      )).toEqual(['<p>5</p>']);
    })

    it('handles multiple ops on one line', () => {
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{text="TEST"}} {{r=[5]}}</p><p>{{text}}{{r}}</p></roleplay>')('roleplay'),
        defaultContext()
      )).toEqual(['<p>TEST5</p>']);
    })

    it('parses ops in instruction nodes', () => {
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{num = 1}}</p><instruction>Hey {{num}}</instruction></roleplay>')('roleplay'),
        defaultContext()
      )).toEqual(['<instruction>Hey 1</instruction>']);
    });

    it('parses ops in choice attribs', () => {
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{num=1}}</p><choice text="Hey {{num}}"></choice></roleplay>')('roleplay'),
        defaultContext()
      )).toEqual(['<choice text="Hey 1"></choice>']);
    });

    it('parses multi-statement ops in body and respects newlines', () => {
      // If the op ends without an assignment, it's displayed. If it does, it's hidden.
      expect(renderedChildren(
        cheerio.load('<roleplay><p>{{a=5;c=7}}</p><p>{{b=7;a}}</p><p>{{a=5\nb=10}}</p><p>{{a=5\nb=10\nc}}</p></roleplay>')('roleplay'),
        defaultContext()
      )).toEqual(['<p>5</p>', '<p>7</p>']);
    });

    it('increments scope._.views.<id>', () => {
      const ctx = defaultContext();
      let result = new Node(cheerio.load('<roleplay id="foo"><p>[roll]</p></roleplay>')('roleplay'), ctx);
      expect(result.ctx.views).toEqual({foo: 1});
      expect(result.ctx.scope._.viewCount('foo')).toEqual(1);
      expect(result.ctx.scope._.viewCount('bar')).toEqual(0);
      result = new Node(cheerio.load('<roleplay id="foo"><p>[roll]</p></roleplay>')('roleplay'), result.ctx);
      expect(result.ctx.views).toEqual({foo: 2});
      expect(result.ctx.scope._.viewCount('foo')).toEqual(2);
      expect(result.ctx.scope._.viewCount('bar')).toEqual(0);
      result = new Node(cheerio.load('<roleplay id="bar"><p>[roll]</p></roleplay>')('roleplay'), result.ctx);
      expect(result.ctx.views).toEqual({foo: 2, bar: 1});
      expect(result.ctx.scope._.viewCount('foo')).toEqual(2);
      expect(result.ctx.scope._.viewCount('bar')).toEqual(1);
    });

    it('renders deterministically when a seed is given', () => {
      const ctx = defaultContext();
      ctx.seed = 'randomseed';
      const result = new Node(cheerio.load('<roleplay><p>{{a=pickRandom([1,2,3,4,5])}}{{b=round(random(0,100), 4)}}{{c=randomInt(0, 100)}}</p></roleplay>')('roleplay'), ctx, undefined, ctx.seed);
      expect(result.ctx.scope).toEqual(jasmine.objectContaining({a: 2, b: 32.3244, c: 40}));
    });

    it('renders next node via getNext deterministically when a seed is given', () => {
      const ctx = defaultContext();
      const result = new Node(cheerio.load('<quest><roleplay></roleplay><roleplay><p>{{a=pickRandom([1,2,3,4,5])}}{{b=round(random(0,100), 4)}}{{c=randomInt(0, 100)}}</p></roleplay></quest>')('quest > :first-child'), ctx);
      const next = result.getNext(0, 'randomseed');
      if (next === null) {
        throw new Error('getNext returned null node');
      }
      expect(next.ctx.scope).toEqual(jasmine.objectContaining({a: 2, b: 32.3244, c: 40}));
    })
  });

  describe('getComparisonKey', () => {
    it('equates separate but identical contexts/node references', () => {
      const e1 = cheerio.load('<quest><roleplay><choice><combat data-line="110"></combat></choice></roleplay></quest>')('combat');
      const p1 = new Node(e1, defaultContext());

      const e2 = cheerio.load('<quest><roleplay><choice><combat data-line="110"></combat></choice></roleplay></quest>')('combat');
      const p2 = new Node(e2, defaultContext());

      expect(p1.getComparisonKey()).toEqual(p2.getComparisonKey());
    });

    it('treats different nodes as unequal', () => {
      const dom = cheerio.load('<quest><roleplay><choice><combat id="c1" data-line="110"></combat><combat id="c2" data-line="111"></combat></choice></roleplay></quest>');
      const e1 = dom('#c1');
      const p1 = new Node(e1, defaultContext());

      const e2 = dom('#c2');
      const p2 = new Node(e2, defaultContext());

      expect(p1.getComparisonKey()).not.toEqual(p2.getComparisonKey());
    });

    it('treats different contexts as unequal', () => {
      const e = cheerio.load('<quest>')('quest');
      const c1 = defaultContext();
      c1.scope.a = 'test';
      const p1 = new Node(e, c1);

      const c2 = defaultContext();
      c2.scope.a = 5;
      const p2 = new Node(e, c2);

      expect(p1.getComparisonKey()).not.toEqual(p2.getComparisonKey());
    })

    it('safely handles lack of quest root', () => {
      const e1 = cheerio.load('<roleplay><choice><combat data-line="110"></combat></choice></roleplay>')('combat');
      const p1 = new Node(e1, defaultContext());

      expect(p1.getComparisonKey()).toBeDefined();
    });
  });

  describe('getEventParameters', () => {
    it('gets parameters', () => {
      const node = cheerio.load('<combat><event on="win" heal="5" loot="false" xp="false"><roleplay></roleplay></event></combat>')('combat');
      const pnode = new Node(node, defaultContext());
      expect(pnode.getEventParameters('win')).toEqual({
        heal: 5, loot: false, xp: false
      });
    });

    it('safely handles event with no params', () => {
      const node = cheerio.load('<combat><event on="win"><roleplay></roleplay></event></combat>')('combat');
      const pnode = new Node(node, defaultContext());
      expect(pnode.getEventParameters('win')).toEqual({});
    });
  });

  describe('handleAction', () => {
    it('skips hidden triggers', () => {
      const node = cheerio.load('<roleplay><choice><trigger if="a">goto 5</trigger><trigger>end</trigger></choice></roleplay>')('roleplay');
      const pnode = new Node(node, defaultContext());
      const result = pnode.handleAction(0);
      if (result === null) {
        throw new Error('handleAction returned null node');
      }
      expect(result.elem.text()).toEqual('end');
    });

    it('uses enabled triggers', () => {
      const quest = cheerio.load('<quest><roleplay><choice><trigger if="a">goto 5</trigger><trigger>end</trigger><roleplay id="5">expected</roleplay><roleplay>wrong</roleplay></choice></roleplay></quest>')('quest');
      const ctx = defaultContext();
      ctx.scope.a = true;
      const pnode = new Node(quest.children().eq(0), ctx);
      const result = pnode.handleAction(0);
      if (result === null) {
        throw new Error('handleAction returned null node');
      }
      expect(result.elem.text()).toEqual('expected');
    });

    it('handles invalid triggers', () => {
      const node = cheerio.load('<roleplay><choice><trigger>goto 5</trigger></choice></roleplay>')('roleplay');
      const pnode = new Node(node, defaultContext());
      const result = pnode.handleAction(0);
      expect(result).toEqual(null);
    });

    it('handles self-referential triggers', () => {
      const node = cheerio.load('<roleplay><choice><trigger id="5">goto 5</trigger></choice></roleplay>')('roleplay');
      const pnode = new Node(node, defaultContext());
      const result = pnode.handleAction(0);
      expect(result).toEqual(null);
    });

    it('triggers events', () => {
      // Note that this even works for handling reserved (e.g. "end") triggers.
      const node = cheerio.load('<roleplay id="rp1"><choice><trigger>end</trigger></choice><choice on="end"><roleplay>expected</roleplay></choice></roleplay>')('#rp1');
      const pnode = new Node(node, defaultContext());
      const result = pnode.handleAction(0);
      if (result === null) {
        throw new Error('handleAction returned null node');
      }
      expect(result.elem.text()).toEqual('expected');
    });

    it('uses programmatic triggers', () => {
      const quest = cheerio.load(`<quest>
        <roleplay>
          <p>{{dest=5}}</p>
          <choice>
            <trigger>goto {{dest}}</trigger>
            <trigger>end</trigger>
            <roleplay id="5">expected</roleplay>
            <roleplay>wrong</roleplay>
          </choice>
        </roleplay>
      </quest>`)('quest');
      const pnode = new Node(quest.children().eq(0), defaultContext());
      const result = pnode.handleAction(0);
      if (result === null) {
        throw new Error('handleAction returned null node');
      }
      expect(result.elem.text()).toEqual('expected');
    });

    it('can handle multiple gotos', () => {
      const quest = cheerio.load('<quest><roleplay><choice><trigger>goto 1</trigger><trigger id="1">goto 2</trigger><trigger id="2">end</trigger><roleplay>wrong</roleplay></choice></roleplay></quest>')('quest');
      const pnode = new Node(quest.children().eq(0), defaultContext());
      const result = pnode.handleAction(0);
      if (result === null) {
        throw new Error('handleAction returned null node');
      }
      expect(result.elem.text()).toEqual('end');
    });

    it('goes to correct choice', () => {
      const node = cheerio.load('<roleplay><choice></choice><choice><roleplay>herp</roleplay><roleplay>derp</roleplay></choice></roleplay>')('roleplay');
      const pnode = new Node(node, defaultContext());
      const result = pnode.handleAction(1);
      if (result === null) {
        throw new Error('handleAction returned null node');
      }
      expect(result.elem.text()).toEqual('herp');
    });

    it('goes to next roleplay node', () => {
      const node = cheerio.load('<roleplay id="rp1">rp1</roleplay><roleplay>rp2</roleplay>')('#rp1');
      const pnode = new Node(node, defaultContext());
      const result = pnode.handleAction(1);
      if (result === null) {
        throw new Error('handleAction returned null node');
      }
      expect(result.elem.text()).toEqual('rp2');
    });

    it('goes to correct event', () => {
      const node = cheerio.load('<roleplay><event></event><event on="test"><roleplay>herp</roleplay><roleplay>derp</roleplay></event></roleplay>')('roleplay');
      const pnode = new Node(node, defaultContext());
      const result = pnode.handleAction('test');
      if (result === null) {
        throw new Error('handleAction returned null node');
      }
      expect(result.elem.text()).toEqual('herp');
    });

    it('follows non-goto triggers within scope', () => {
      const node = cheerio.load(`
        <roleplay>
          <choice>
            <roleplay>
              <choice>
                <trigger>test</trigger>
              </choice>
            </roleplay>
          </choice>
          <event on="test"><roleplay><p>herp</p></roleplay></event>
        </roleplay>
      `)('roleplay');
      const pnode = new Node(node, defaultContext());
      let result = pnode.handleAction('0');
      if (result === null) {
        throw new Error('handleAction returned null node');
      }
      result = result.handleAction('0');
      if (result === null) {
        throw new Error('handleAction returned null node');
      }
      expect(result.elem.text()).toEqual('herp');
    });

    it('immediately follows triggers on otherwise empty choices', () => {
      const rootNode = cheerio.load('<quest></quest>')('quest');
      const choiceNode = cheerio.load('<roleplay><choice><trigger>goto jump</trigger></choice></roleplay>')('roleplay');
      const jumpNode = cheerio.load('<roleplay id="jump">Jumped</roleplay>')('roleplay');

      rootNode.append(choiceNode);
      rootNode.append(jumpNode);

      const pnode = new Node(choiceNode, defaultContext());
      const result = pnode.handleAction(0);
      if (result === null) {
        throw new Error('handleAction returned null node');
      }
      expect(result.elem.text()).toEqual('Jumped');
    });

    it('does not immediately follow triggers on non-empty choices', () => {
      const node = cheerio.load('<roleplay><choice><roleplay>Not empty</roleplay><trigger>goto jump</trigger></choice></roleplay><roleplay id="jump">Hello</roleplay>')('roleplay');
      const pnode = new Node(node, defaultContext());
      const result = pnode.handleAction(0);
      if (result === null) {
        throw new Error('handleAction returned null node');
      }
      expect(result.elem.text()).toEqual('Not empty');
    });

    it('handles basic choices deterministically when seed is set', () => {
      const node = cheerio.load('<roleplay><choice><roleplay><p>{{a=round(random(0,100), 4)}}</p></roleplay></choice></roleplay>')('roleplay');
      const pnode = new Node(node, defaultContext());
      const result = pnode.handleAction(0, 'randomseed');
      if (result === null) {
        throw new Error('handleAction returned null node');
      }
      expect(result.ctx.scope.a).toEqual(32.8971);
    });

    it('handles choices with id gotos deterministically when seed is set', () => {
      const rootNode = cheerio.load('<quest></quest>')('quest');
      const choiceNode = cheerio.load('<roleplay><choice><trigger>goto jump</trigger></choice></roleplay>')('roleplay');
      const jumpNode = cheerio.load('<roleplay id="jump"><p>{{a=round(random(0,100), 4)}}</p></roleplay>')('roleplay');

      rootNode.append(choiceNode);
      rootNode.append(jumpNode);

      const pnode = new Node(choiceNode, defaultContext());
      const result = pnode.handleAction(0, 'randomseed');
      if (result === null) {
        throw new Error('handleAction returned null node');
      }
      expect(result.ctx.scope.a).toEqual(32.8971);
    });

    it('handles choices with event gotos deterministically when seed is set', () => {
      const node = cheerio.load('<roleplay id="rp1"><choice><trigger>end</trigger></choice><choice on="end"><roleplay><p>{{a=round(random(0,100), 4)}}</p></roleplay></choice></roleplay>')('#rp1');
      const pnode = new Node(node, defaultContext());
      const result = pnode.handleAction(0, 'randomseed');
      if (result === null) {
        throw new Error('handleAction returned null node');
      }
      expect(result.ctx.scope.a).toEqual(32.8971);
    });

    it('handles randomly-generated triggers deterministically when seed is set', () => {
      const quest = cheerio.load(`<quest>
        <roleplay>
          <choice>
            <trigger>goto {{randomInt(5)}}</trigger>
          </choice>
        </roleplay>
        <roleplay id="0">r0</roleplay>
        <roleplay id="1">r1</roleplay>
        <roleplay id="2">r2</roleplay>
        <roleplay id="3">r3</roleplay>
        <roleplay id="4">r4</roleplay>
      </quest>`)('quest');
      const pnode = new Node(quest.children().eq(0), defaultContext());
      const result = pnode.handleAction(0, 'randomseed');
      if (result === null) {
        throw new Error('handleAction returned null node');
      }
      expect(result.elem.text()).toEqual('r1');
    })
  });
});
