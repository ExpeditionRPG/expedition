import TextView from './TextView';
test('updates source on local edits, suppresses remote echo and moves cursor on local undo', () => {
  const props: any = {
    annotations: [],
    onChange: jest.fn(),
    onLine: jest.fn(),
    onAnnotationClick: jest.fn(),
    realtime: { setText: jest.fn() },
    lastSizeChangeMillis: 0,
  };
  const view = new TextView(props);
  view.onChange('new text');
  expect(props.realtime.setText).toHaveBeenCalledWith('new text');
  expect(props.onChange).toHaveBeenCalledWith('new text');
  view.silentChange = true;
  view.onChange('remote');
  expect(props.onChange).toHaveBeenCalledTimes(1);
  view.silentChange = false;
  const doc = {
    indexToPosition: (i: number) => ({ row: 0, column: i }),
    insert: jest.fn(),
    remove: jest.fn(),
  };
  view.ace = {
    editor: { session: { getDocument: () => doc }, gotoLine: jest.fn() },
  };
  view.onTextInserted({ index: 2, text: 'hi', isLocal: false });
  expect(doc.insert).toHaveBeenCalledWith({ row: 0, column: 2 }, 'hi');
  expect(view.ace.editor.gotoLine).not.toHaveBeenCalled();
  view.onTextDeleted({ index: 2, text: 'hi', isLocal: true, isUndo: true });
  expect(doc.remove).toHaveBeenCalledWith(
    expect.objectContaining({
      start: { row: 0, column: 2 },
      end: { row: 0, column: 4 },
    }),
  );
  expect(view.ace.editor.gotoLine).toHaveBeenCalledWith(1, 2);
});
test('opens unique annotation details for the clicked row only', () => {
  const onAnnotationClick = jest.fn();
  const view = new TextView({ onAnnotationClick } as any);
  const icon = document.createElement('div');
  icon.className = 'ace_error';
  icon.textContent = '3';
  const preventDefault = jest.fn();
  view.onGutterClick({
    domEvent: { path: [icon] },
    editor: {
      session: {
        getAnnotations: () => [
          { row: 2, text: 'Error 419: bad' },
          { row: 2, text: 'Error 419: duplicate' },
          { row: 1, text: 'Error 430: other' },
          { row: 2, text: '(Click for details)' },
        ],
      },
    },
    preventDefault,
  });
  expect(onAnnotationClick).toHaveBeenCalledWith([419]);
  expect(preventDefault).toHaveBeenCalledTimes(1);
});
