import * as React from 'react';
import { shallow } from 'enzyme';
import QuestIDE from './QuestIDE';
import TextView from './base/TextView';
// The former tabbed editor is now one QDL editor beside a live preview.
test('forwards QDL editor configuration and editor interactions', () => {
  const props = {
    annotations: [],
    lastSplitPaneDragMillis: 4,
    line: 5,
    lineTs: 6,
    realtime: {},
    realtimeModel: {},
    showLineNumbers: true,
    showSpellcheck: true,
    tutorial: { playFromCursor: true },
    onAnnotationClick: jest.fn(),
    onDirty: jest.fn(),
    onLine: jest.fn(),
  };
  const view = shallow(<QuestIDE {...props} />);
  const editor = view.find(TextView);
  expect(editor.props()).toEqual(
    expect.objectContaining({
      realtime: props.realtime,
      scrollLineTarget: 5,
      scrollLineTargetTs: 6,
      lastSizeChangeMillis: 4,
      showLineNumbers: true,
      showSpellcheck: true,
    }),
  );
  editor.prop('onChange')('edited');
  expect(props.onDirty).toHaveBeenCalledWith(props.realtime, 'edited');
  editor.prop('onLine')(8);
  expect(props.onLine).toHaveBeenCalledWith(8);
  editor.prop('onAnnotationClick')([419]);
  expect(props.onAnnotationClick).toHaveBeenCalledWith([419]);
  expect(view.find('.play-from-cursor-tutorial')).toHaveLength(1);
  view.setProps({ tutorial: { playFromCursor: false } });
  expect(view.find('.play-from-cursor-tutorial')).toHaveLength(0);
});
