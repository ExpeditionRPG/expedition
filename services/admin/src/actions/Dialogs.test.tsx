import { setDialog } from './Dialogs';
import { dialogs } from '../reducers/Dialogs';
test('selects and closes the requested details dialog through the reducer', () => {
  const open = dialogs(undefined, setDialog('USER_DETAILS'));
  expect(open.open).toBe('USER_DETAILS');
  expect(dialogs(open, setDialog('NONE')).open).toBe('NONE');
});
