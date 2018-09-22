import * as React from 'react';
import {configure, shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {
  TextAreaDialog,
  BaseDialogProps,
  ConfirmationDialog,
  BaseDialogProps
  MultiplayerStatusDialogProps,
  MultiplayerStatusDialog,
  ExpansionSelectDialogProps,
  ExpansionSelectDialog,
  SetPlayerCountDialogProps,
  SetPlayerCountDialog,
} from './Dialogs';
import {loggedOutUser} from '../../reducers/User';
import {initialSettings} from '../../reducers/Settings';
import {initialMultiplayerCounters} from '../../Multiplayer';
import {FEATURED_QUESTS} from '../../Constants';
import {Quest} from 'shared/schema/Quests';
configure({ adapter: new Adapter() });

describe('Dialogs', () => {
  // Simple dialog components that implement ConfirmationDialog or TextAreaDialog
  // do not need to be tested.
  describe('ConfirmationDialog', () => {
    class DialogTmpl extends ConfirmationDialog<BaseDialogProps> {
      public actionSpy: jasmine.Spy;
      constructor(props: BaseDialogProps) {
        super(props);
        this.title = 'Test Title';
        this.content = <p>Test Content</p>;
        this.actionSpy = jasmine.createSpy('onAction');
      }
      public onAction() {
        this.actionSpy();
      }
    }
    function setup(overrides?: Partial<BaseDialogProps>) {
      const props: Props = {
        open: true,
        onClose: jasmine.createSpy('onClose'),
        ...overrides,
      };
      return {props, e: shallow(<DialogTmpl {...(props as any as BaseDialogProps)} />, undefined /*renderOptions*/)};
    }
    test('renders title & content', () => {
      const {e} = setup();
      expect(e.childAt(0).render().text()).toContain('Test Title');
      expect(e.childAt(1).render().text()).toContain('Test Content');
    });
    test('calls onAction on action tap', () => {
      const {e} = setup();
      e.find('#actionButton').simulate('click');
      expect(e.instance().actionSpy).toHaveBeenCalledTimes(1);
    });
    test('calls onClose on cancel tap', () => {
      const {props, e} = setup();
      e.find('#closeButton').simulate('click');
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('TextAreaDialog', () => {
    class DialogTmpl extends TextAreaDialog<BaseDialogProps> {
      public onSubmit: jasmine.Spy;
      constructor(props: BaseDialogProps) {
        super(props);
        this.title = 'Test Title';
        this.content = <p>Test Content</p>;
        this.helperText = 'Test HelperText';
        this.onSubmit = jasmine.createSpy('onSubmit');
      }
      public onAction() {
        this.onSubmit();
      }
    }
    function setup(overrides?: Partial<BaseDialogProps>) {
      const props: Props = {
        open: true,
        onClose: jasmine.createSpy('onClose'),
        ...overrides,
      };
      return {props, e: shallow(<DialogTmpl {...(props as any as BaseDialogProps)} />, undefined /*renderOptions*/)};
    }
    test('renders title & content', () => {
      const {e} = setup();
      expect(e.childAt(0).render().text()).toContain('Test Title');
      expect(e.childAt(1).render().text()).toContain('Test Content');
    });
    test('updates text state', () => {
      const {e} = setup();
      e.find('.textfield').simulate('change', {target: {value: 'asdf'}});
      expect(e.state().text).toEqual('asdf');
    });
    test('calls onSubmit on submission', () => {
      const {e} = setup();
      e.find('#submitButton').simulate('click');
      expect(e.instance().onSubmit).toHaveBeenCalledTimes(1);
    });
    test('calls onClose on Cancel tap', () => {
      const {props, e} = setup();
      e.find('#cancelButton').simulate('click');
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('MultiplayerStatusDialog', () => {
    function setup(counters?: Partial<MultiplayerCounters>) {
      const props: Props = {
        onClose: jasmine.createSpy('onClose'),
        onSendReport: jasmine.createSpy('onSendReport'),
        open: true,
        questDetails: new Quest(FEATURED_QUESTS[0]),
        stats: {...initialMultiplayerCounters, ...counters},
        user: loggedOutUser,
      };
      return {props, e: shallow(<MultiplayerStatusDialog {...(props as any as MultiplayerStatusDialogProps)} />, undefined /*renderOptions*/)};
    }
    test('shows stats', () => {
      const {e} = setup({receivedEvents: 500});
      expect(e.childAt(1).render().text()).toContain("receivedEvents: 500");
    });
    test('sends report', () => {
      const {props, e} = setup();
      e.find('#sendReportButton').simulate('click');
      expect(props.onSendReport).toHaveBeenCalledTimes(1);
    });
  });

  describe('ExpansionSelectDialog', () => {
    function setup(overrides?: Partial<ExpansionSelectDialogProps>) {
      const props: Props = {
        onExpansionSelect: jasmine.createSpy('onExpansionSelect');
        open: true,
        ...overrides,
      };
      return {props, e: shallow(<ExpansionSelectDialog {...(props as any as ExpansionSelectDialogProps)} />, undefined /*renderOptions*/)};
    }

    test('sets no content sets if base game', () => {
      const {props, e} = setup();
      e.find('#base').simulate('click');
      expect(props.onExpansionSelect).toHaveBeenCalledWith({horror: false, future: false});
    });
    test('sets horror content set', () => {
      const {props, e} = setup();
      e.find('#horror').simulate('click');
      expect(props.onExpansionSelect).toHaveBeenCalledWith({horror: true});
    });
    test('sets horror + future content sets', () => {
      const {props, e} = setup();
      e.find('#future').simulate('click');
      expect(props.onExpansionSelect).toHaveBeenCalledWith({horror: true, future: true});
    });
    test('has buttons for all content sets', () => {
      const {props, e} = setup();
      const sets: {[set: string]: boolean} = {};
      FEATURED_QUESTS.map((q) => {
        const setAttrs = Object.keys(q).filter((k) => k.startsWith('expansion')).map((k) => k.match(/^expansion(.*)/)[1]);
        for (const a of setAttrs) {
          sets[a] = true;
        }
      });
      expect(Object.keys(sets).length).toBeGreaterThan(0);
      for (const s of Object.keys(sets)) {
        expect(e.find('#'+s).length).toEqual(1);
      }
    });
  });

  describe('SetPlayerCountDialog', () => {
    function setup(overrides?: Partial<SetPlayerCountDialogProps>) {
      const props: Props = {
        open: true,
        quest: new Quest(FEATURED_QUESTS[0]),
        settings: {...initialSettings},
        onClose: jasmine.createSpy('onClose'),
        onMultitouchChange: jasmine.createSpy('onMultitouchChange'),
        onPlayerDelta: jasmine.createSpy('onPlayerDelta'),
        playQuest: jasmine.createSpy('playQuest'),
        ...overrides,
      };
      return {props, e: shallow(<SetPlayerCountDialog {...(props as any as SetPlayerCountDialogProps)} />, undefined /*renderOptions*/)};
    }
    test('enables play under normal circumstances', () => {
      const {props, e} = setup();
      expect(e.find('#play').prop('disabled')).toEqual(false);
    })
    test('can adjust player count', () => {
      const {props, e} = setup();
      e.find('#adventurerCount').prop('onDelta')(1);
      expect(props.onPlayerDelta).toHaveBeenCalledWith(jasmine.any(Number), 1);
    });
    test('can enable/disable multitouch', () => {
      const {props, e} = setup();
      e.find('#multitouch').prop('onChange')(true);
      expect(props.onMultitouchChange).toHaveBeenCalledWith(true);
    });
    test('shows requirement if player count is outside of quest num players range and disables play', () => {
      const {props, e} = setup({settings: {...initialSettings, numPlayers: 7}});
      expect(e.childAt(1).render().text()).toContain('Quest requires');
      expect(e.find('#play').prop('disabled')).toEqual(true);
    });
    test('indicates required expansion (and hides Play) if not properly configured', () => {
      const {props, e} = setup({quest: new Quest({...FEATURED_QUESTS[0], expansionhorror: true})});
      expect(e.childAt(1).render().text()).toContain('expansion is required');
      expect(e.find('#play').length).toEqual(0);
    });
  });
});
