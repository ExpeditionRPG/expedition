import * as React from 'react';
import { shallow } from 'enzyme';
import NotesPanel from './NotesPanel';
test('initializes notes and applies remote inserts/deletes without re-saving them', () => {
  const realtime = {
    getText: () => 'hello',
    removeAllEventListeners: jest.fn(),
  };
  const onDirty = jest.fn();
  const view = shallow(
    <NotesPanel realtime={realtime} realtimeModel={{}} onDirty={onDirty} />,
  )
    .find('RealtimeTextArea')
    .dive();
  const instance: any = view.instance();
  const input = { value: '' };
  instance.onRef(input);
  expect(input.value).toBe('hello');
  instance.onTextInserted({ index: 5, text: ' world', isLocal: false });
  expect(input.value).toBe('hello world');
  instance.onTextDeleted({ index: 0, text: 'hello ', isLocal: false });
  expect(input.value).toBe('world');
  expect(onDirty).not.toHaveBeenCalled();
  instance.onTextInserted({ index: 0, text: 'local', isLocal: true });
  expect(input.value).toBe('world');
  view.find('textarea').simulate('change', { target: { value: 'edited' } });
  expect(onDirty).toHaveBeenCalledWith(realtime, 'edited');
});
