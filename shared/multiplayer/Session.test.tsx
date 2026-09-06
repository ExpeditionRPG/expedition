import { makeSecret, toClientKey } from './Session';

describe('Session', () => {
  describe('makeSecret', () => {
    test('generates a secret string', () => {
      for (let i = 0; i < 50; i++) {
        expect(makeSecret()).toMatch(/^[A-Z]{4}$/);
      }
    });

    test('generates a range of secrets, not a constant', () => {
      const seen = new Set<string>();
      for (let i = 0; i < 100; i++) {
        seen.add(makeSecret());
      }
      // 26^4 possibilities; 100 draws collapsing to one value would mean the
      // generator isn't actually random.
      expect(seen.size).toBeGreaterThan(1);
    });

    test('allows procedural secret generation', () => {
      // The generator draws exactly one Math.random() per character, in order,
      // so a seeded/stubbed source of randomness produces a predictable secret.
      const draws = [0, 0.05, 0.1, 0.9];
      let i = 0;
      const random = jest
        .spyOn(Math, 'random')
        .mockImplementation(() => draws[i++]);
      try {
        expect(makeSecret()).toEqual('ABCX');
        expect(random).toHaveBeenCalledTimes(4);
      } finally {
        random.mockRestore();
      }
    });
  });

  describe('toClientKey', () => {
    test('joins the client and instance with a pipe', () => {
      expect(toClientKey('client1', 'instance1')).toEqual('client1|instance1');
    });

    test('is unique per instance of the same client', () => {
      expect(toClientKey('c', 'i1')).not.toEqual(toClientKey('c', 'i2'));
    });

    test('is stable, so it can be used as a map key', () => {
      const map: { [k: string]: number } = {};
      map[toClientKey('c', 'i')] = 1;
      expect(map[toClientKey('c', 'i')]).toEqual(1);
    });
  });
});
