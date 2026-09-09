import * as cheerio from 'shared/Cheerio';
import { initialSettings } from 'app/reducers/Settings';
import {
  defaultContext,
  getCardTemplateTheme,
  renderCardTemplate,
} from '../Template';
import { ParserNode } from '../TemplateTypes';
import RoleplayContainer from './RoleplayContainer';

// RoleplayPhase is a type alias only. Exercise its runtime template routing.
test('routes ordinary roleplay to the light roleplay template', () => {
  const node = new ParserNode(
    cheerio.load('<roleplay>Hello</roleplay>')('roleplay'),
    defaultContext(),
  );
  expect(renderCardTemplate(node, initialSettings).type).toBe(
    RoleplayContainer,
  );
  expect(renderCardTemplate(node, initialSettings).props.node).toBe(node);
  expect(getCardTemplateTheme(node)).toBe('light');
});
