import * as cheerio from 'shared/Cheerio';
import { defaultContext } from '../Template';
import { ParserNode } from '../TemplateTypes';
import { initialSettings } from 'app/reducers/Settings';
import { initialMultiplayer } from 'app/reducers/Multiplayer';
import { mapStateToProps } from './Types';

test('derives default light theme and seeded RNG without an explicit theme', () => {
  const node = new ParserNode(
    cheerio.load('<decision></decision>')('decision'),
    defaultContext(),
  );
  const state = {
    quest: { node },
    settings: initialSettings,
    multiplayer: initialMultiplayer,
  } as any;
  const first = mapStateToProps(state, {});
  const second = mapStateToProps(state, {});
  expect(first.theme).toBe('light');
  expect(first.node).toBe(node);
  expect(first.settings).toBe(initialSettings);
  expect(first.rng()).toBe(second.rng());
});
