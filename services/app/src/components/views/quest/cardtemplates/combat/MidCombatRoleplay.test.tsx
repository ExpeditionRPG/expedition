import * as React from 'react';
import { shallow } from 'enzyme';
import Button from 'app/components/base/Button';
import Card from 'app/components/base/Card';
import { initialSettings } from 'app/reducers/Settings';
import { initialMultiplayer } from 'app/reducers/Multiplayer';
import { EMPTY_COMBAT_STATE } from './Types';
import MidCombatRoleplay from './MidCombatRoleplay';
import { defaultContext } from '../Template';
import { ParserNode } from '../TemplateTypes';
import * as cheerio from 'shared/Cheerio';
test('renders current narrative in the dark theme and forwards choices with combat context', () => {
  const node = new ParserNode(
    cheerio.load(
      '<roleplay title="Battle"><p>Take cover.</p><choice text="Continue"><trigger>end</trigger></choice></roleplay>',
    )('roleplay'),
    defaultContext(),
  );
  const props: any = {
    node,
    settings: initialSettings,
    questID: 'quest',
    maxTier: 4,
    seed: 'seed',
    onChoice: jest.fn(),
    onRetry: jest.fn(),
    onReturn: jest.fn(),
  };
  const e = shallow(<MidCombatRoleplay {...props} />);
  expect(e.find(Card).prop('theme')).toBe('dark');
  expect(
    e
      .find('[dangerouslySetInnerHTML]')
      .map(n => n.prop<any>('dangerouslySetInnerHTML').__html)
      .join(' '),
  ).toContain('Take cover.');
  e.find(Button).first().simulate('click');
  expect(props.onChoice).toHaveBeenCalledWith(
    node,
    initialSettings,
    0,
    4,
    'seed',
  );
});
