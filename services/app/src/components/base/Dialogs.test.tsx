import { TUTORIAL_QUESTS } from 'app/Constants';
import { initialMultiplayerCounters } from 'app/multiplayer/Connection';
import { initialMultiplayer } from 'app/reducers/Multiplayer';
import { initialSettings } from 'app/reducers/Settings';
import { mount, unmountAll } from 'app/Testing';
import * as React from 'react';
import { loggedOutUser } from 'shared/auth/UserState';
import { Quest } from 'shared/schema/Quests';
import {
  BaseDialogProps,
  ConfirmationDialog,
  ExpansionSelectDialog,
  ExpansionSelectDialogProps,
  MultiplayerPeersDialog,
  MultiplayerPeersDialogProps,
  MultiplayerStatusDialog,
  MultiplayerStatusDialogProps,
  SetPlayerCountDialog,
  SetPlayerCountDialogProps,
  TextAreaDialog,
  TooManyPlayersDialog,
} from './Dialogs';

describe('Dialogs', () => {
  afterEach(unmountAll);

  // Simple dialog components that implement ConfirmationDialog or TextAreaDialog
  // do not need to be tested.
  describe('ConfirmationDialog', () => {
    class DialogTmpl extends ConfirmationDialog<BaseDialogProps> {
      public actionSpy: jest.Mock;
      constructor(props: BaseDialogProps) {
        super(props);
        this.title = 'Test Title';
        this.content = <p>Test Content</p>;
        this.actionSpy = jest.fn();
      }
      public onAction() {
        this.actionSpy();
      }
    }
    function setup(overrides?: Partial<BaseDialogProps>) {
      const props: Props = {
        open: true,
        onClose: jest.fn(),
        ...overrides,
      };
      return {
        props,
        e: mount(<DialogTmpl {...props} />),
      };
    }
    test('renders title & content', () => {
      const { e } = setup();
      expect(e.find('DialogTitle').render().text()).toContain('Test Title');
      expect(e.find('DialogContent').render().text()).toContain('Test Content');
    });
    test('calls onAction on action tap', () => {
      const { e } = setup();
      e.find('#actionButton').hostNodes().prop('onClick')();
      expect(e.instance().actionSpy).toHaveBeenCalledTimes(1);
    });
    test('calls onClose on cancel tap', () => {
      const { props, e } = setup();
      e.find('#closeButton').hostNodes().prop('onClick')();
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('TextAreaDialog', () => {
    class DialogTmpl extends TextAreaDialog<BaseDialogProps> {
      public onSubmitSpy: jest.Mock;
      constructor(props: BaseDialogProps) {
        super(props);
        this.title = 'Test Title';
        this.content = <p>Test Content</p>;
        this.helperText = 'Test HelperText';
        this.onSubmitSpy = jest.fn();
      }
      public onSubmit() {
        this.onSubmitSpy(this.state);
      }
    }
    function setup(overrides?: Partial<BaseDialogProps>) {
      const props: Props = {
        open: true,
        onClose: jest.fn(),
        ...overrides,
      };
      return {
        props,
        e: mount(<DialogTmpl {...props} />),
      };
    }
    test('renders title & content', () => {
      const { e } = setup();
      expect(e.find('DialogTitle').render().text()).toContain('Test Title');
      expect(e.find('DialogContent').render().text()).toContain('Test Content');
    });
    test('updates text state', () => {
      const { e, props } = setup();
      // Because we're testing with enzyme, renders don't happen typical to
      // component lifecycle. Here we check that a rerender should occur
      // (i.e. the update is not suppressed when the text input value changes).
      expect(
        e.instance().shouldComponentUpdate(props, { text: 'asdf' }),
      ).toEqual(true);

      e.find('TextField').prop('onChange')({ target: { value: 'asdf' } });
      e.find('#submitButton').hostNodes().prop('onClick')();
      expect(e.instance().onSubmitSpy).toHaveBeenCalledWith({ text: 'asdf' });
    });
    test('calls onSubmit on submission', () => {
      const { e } = setup();
      e.find('#submitButton').hostNodes().prop('onClick')();
      expect(e.instance().onSubmitSpy).toHaveBeenCalledTimes(1);
    });
    test('clears text on submission', () => {
      const { e } = setup();
      e.find('TextField').prop('onChange')({ target: { value: 'asdf' } });
      expect(e.find('TextField').render().text()).toContain('asdf');
      e.find('#submitButton').hostNodes().prop('onClick')();
      expect(e.find('TextField').render().text()).not.toContain('asdf');
    });
    test('calls onClose on Cancel tap', () => {
      const { props, e } = setup();
      e.find('#cancelButton').hostNodes().prop('onClick')();
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('MultiplayerStatusDialog', () => {
    function setup(counters?: Partial<MultiplayerCounters>) {
      const props: Props = {
        onClose: jest.fn(),
        onSendReport: jest.fn(),
        open: true,
        questDetails: new Quest(TUTORIAL_QUESTS[0]),
        multiplayer: initialMultiplayer,
        stats: { ...initialMultiplayerCounters, ...counters },
        user: loggedOutUser,
      };
      return {
        props,
        e: mount(<MultiplayerStatusDialog {...props} />),
      };
    }
    test('shows stats', () => {
      const { e } = setup({ receivedEvents: 500 });
      expect(e.find('DialogContent').render().text()).toContain(
        'receivedEvents: 500',
      );
    });
  });

  describe('MultiplayerPeersDialog', () => {
    function setup(overrides?: Partial<MultiplayerPeersDialogProps>) {
      const props: Props = {
        onClose: jest.fn(),
        open: true,
        multiplayer: initialMultiplayer,
        ...overrides,
      };
      return {
        props,
        e: mount(<MultiplayerPeersDialog {...props} />),
      };
    }

    test('shows peers & player count', () => {
      const { e } = setup({
        multiplayer: {
          ...initialMultiplayer,
          clientStatus: {
            a: { numLocalPlayers: 3, name: 'p1' },
            b: { numLocalPlayers: 2, name: 'p2' },
          },
        },
      });
      const text = e.find('DialogContent').render().text();
      expect(text).toMatch(/p1.?3 Players/);
      expect(text).toMatch(/p2.?2 Players/);
    });
  });

  describe('ExpansionSelectDialog', () => {
    function setup(overrides?: Partial<ExpansionSelectDialogProps>) {
      const props: Props = {
        onExpansionSelect: jest.fn(),
        settings: { contentSets: [] },
        open: true,
        ...overrides,
      };
      return {
        props,
        e: mount(<ExpansionSelectDialog {...props} />),
      };
    }

    test('sets no content sets if base game', () => {
      const { props, e } = setup();
      e.find('#base').hostNodes().prop('onClick')();
      expect(props.onExpansionSelect).toHaveBeenCalledWith({
        horror: false,
        future: false,
      });
    });
    test('sets horror content set', () => {
      const { props, e } = setup();
      e.find('#horror').hostNodes().prop('onClick')();
      expect(props.onExpansionSelect).toHaveBeenCalledWith({
        horror: true,
        future: false,
      });
    });
    test('sets horror + future content sets', () => {
      const { props, e } = setup();
      e.find('#future').hostNodes().prop('onClick')();
      expect(props.onExpansionSelect).toHaveBeenCalledWith({
        horror: true,
        future: true,
      });
    });
    test('has buttons for all content sets', () => {
      const { props, e } = setup();
      const sets: { [set: string]: boolean } = {};
      TUTORIAL_QUESTS.map(q => {
        const setAttrs = Object.keys(q)
          .filter(k => k.startsWith('expansion'))
          .map(k => k.match(/^expansion(.*)/)[1]);
        for (const a of setAttrs) {
          sets[a] = true;
        }
      });
      expect(Object.keys(sets).length).toBeGreaterThan(0);
      for (const s of Object.keys(sets)) {
        expect(e.find('#' + s).hostNodes().length).toEqual(1);
      }
    });
  });

  describe('SetPlayerCountDialog', () => {
    function setup(overrides?: Partial<SetPlayerCountDialogProps>) {
      const props: Props = {
        open: true,
        quest: new Quest(TUTORIAL_QUESTS[0]),
        settings: { ...initialSettings },
        onClose: jest.fn(),
        onMultitouchChange: jest.fn(),
        onPlayerChange: jest.fn(),
        playQuest: jest.fn(),
        ...overrides,
      };
      return {
        props,
        e: mount(<SetPlayerCountDialog {...props} />),
      };
    }
    test('enables play under normal circumstances', () => {
      const { props, e } = setup();
      expect(e.find('#play').hostNodes().prop('disabled')).toEqual(false);
    });
    test('can adjust player count', () => {
      const { props, e } = setup();
      e.find('PlayerCount#playerCount').prop('onChange')(0);
      expect(props.onPlayerChange).toHaveBeenCalledWith(0);
    });
    test('can enable/disable multitouch', () => {
      const { props, e } = setup();
      e.find('#multitouch').hostNodes().find('Button').prop('onClick')();
      expect(props.onMultitouchChange).toHaveBeenCalledWith(false);
    });
    test('shows requirement if player count is outside of quest num players range and disables play', () => {
      const { props, e } = setup({
        settings: { ...initialSettings, numLocalPlayers: 7 },
      });
      expect(e.find('DialogContent').render().text()).toContain(
        'Quest requires',
      );
      expect(e.find('#play').hostNodes().prop('disabled')).toEqual(true);
    });
    test('indicates required expansion (and hides Play) if not properly configured', () => {
      const { props, e } = setup({
        quest: new Quest({ ...TUTORIAL_QUESTS[0], expansionhorror: true }),
      });
      expect(e.find('DialogContent').render().text()).toContain(
        'expansion is required',
      );
      expect(e.find('#play').length).toEqual(0);
    });
  });

  describe('TooManyPlayersDialog', () => {
    function setup(overrides?: Partial<BaseDialogProps>) {
      const props: Props = {
        open: true,
        onClose: jest.fn(),
        ...overrides,
      };
      return {
        props,
        e: mount(<TooManyPlayersDialog {...props} />),
      };
    }

    test('renders title & content', () => {
      const { e } = setup();
      expect(e.find('DialogTitle').render().text()).toContain(
        'Too many players!',
      );
      expect(e.find('DialogContent').render().text()).toContain(
        'Expedition can only be played by a maximum of 6 players.',
      );
    });

    test('calls onClose on Cancel tap', () => {
      const { props, e } = setup();
      e.find('#cancelButton').hostNodes().prop('onClick')();
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });
  });
});
