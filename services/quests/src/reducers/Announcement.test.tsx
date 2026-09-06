import { AnnouncementSetAction } from '../actions/ActionTypes';
import { announcement } from './Announcement';
import { AnnouncementState } from './StateTypes';

const CLOSED: AnnouncementState = { link: '', message: '', open: false };

describe('announcement', () => {
  test('returns initial state', () => {
    expect(announcement(undefined, { type: '@@INIT' })).toEqual(CLOSED);
  });

  test('passes through unknown actions without changing the state object', () => {
    const state: AnnouncementState = {
      link: 'https://expedition',
      message: 'hi',
      open: true,
    };
    expect(announcement(state, { type: 'SOME_OTHER_ACTION' })).toBe(state);
  });

  describe('ANNOUNCEMENT_SET', () => {
    test('sets open, message and link', () => {
      const action: AnnouncementSetAction = {
        link: 'https://expeditiongame.com',
        message: 'New expansion available!',
        open: true,
        type: 'ANNOUNCEMENT_SET',
      };
      expect(announcement(CLOSED, action)).toEqual({
        link: 'https://expeditiongame.com',
        message: 'New expansion available!',
        open: true,
      });
    });

    test('falls back to initial values for omitted message and link', () => {
      const action = {
        open: true,
        type: 'ANNOUNCEMENT_SET',
      } as AnnouncementSetAction;
      expect(announcement(CLOSED, action)).toEqual({
        link: '',
        message: '',
        open: true,
      });
    });

    test('clears a previously-set announcement when closed', () => {
      const state: AnnouncementState = {
        link: 'https://old',
        message: 'old news',
        open: true,
      };
      const action = {
        open: false,
        type: 'ANNOUNCEMENT_SET',
      } as AnnouncementSetAction;
      expect(announcement(state, action)).toEqual(CLOSED);
    });

    test('does not mutate the state it was handed', () => {
      const state: AnnouncementState = {
        link: 'https://old',
        message: 'old news',
        open: true,
      };
      const action: AnnouncementSetAction = {
        link: 'https://new',
        message: 'new news',
        open: true,
        type: 'ANNOUNCEMENT_SET',
      };
      const result = announcement(state, action);
      expect(state).toEqual({
        link: 'https://old',
        message: 'old news',
        open: true,
      });
      expect(result).not.toBe(state);
    });

    test('does not leak the action type into the state', () => {
      const action: AnnouncementSetAction = {
        link: 'https://expeditiongame.com',
        message: 'hello',
        open: true,
        type: 'ANNOUNCEMENT_SET',
      };
      expect(Object.keys(announcement(CLOSED, action)).sort()).toEqual([
        'link',
        'message',
        'open',
      ]);
    });
  });
});
