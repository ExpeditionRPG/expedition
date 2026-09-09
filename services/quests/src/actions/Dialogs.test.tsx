import { setDialog, pushError, pushHTTPError } from './Dialogs';
const ga = require('react-ga');
test('creates dialog actions with annotation IDs', () => {
  expect(setDialog('ERROR', true)).toEqual({
    type: 'SET_DIALOG',
    dialog: 'ERROR',
    shown: true,
    annotations: undefined,
  });
  expect(setDialog('ANNOTATION_DETAIL', true, [419]).annotations).toEqual([
    419,
  ]);
});
test('pushes the original error and logs its name/message', () => {
  const event = jest.spyOn(ga, 'event').mockImplementation(() => undefined);
  const error = new Error('failed');
  expect(pushError(error)).toEqual({ type: 'PUSH_ERROR', error });
  expect(event).toHaveBeenCalledWith({
    action: 'Error: failed',
    category: 'Error',
    label: 'Error',
  });
});
test('uses HTTP status as error name and response body as message and analytics', () => {
  const event = jest.spyOn(ga, 'event').mockImplementation(() => undefined);
  const result = pushHTTPError({
    statusText: 'Forbidden',
    status: '403',
    responseText: 'denied',
  });
  expect(result.error.name).toBe('Forbidden (403)');
  expect(result.error.message).toBe('denied');
  expect(event).toHaveBeenCalledWith({
    action: 'Forbidden (403): denied',
    category: 'Error',
    label: 'Forbidden (403)',
  });
});
