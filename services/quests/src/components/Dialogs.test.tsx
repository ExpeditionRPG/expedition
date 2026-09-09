import * as React from 'react';
import { shallow } from 'enzyme';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import { loggedOutUser } from 'shared/auth/UserState';
import { EditableMap } from '../Editable';
import Dialogs, {
  ErrorDialog,
  AnnotationDetailDialog,
  PublishingDialog,
} from './Dialogs';
import Checkbox from './base/Checkbox';
// Confirmation and user dialogs were replaced by autosave and direct authentication.
test.each([true, false])(
  'error and annotation dialogs reflect open=%s and close on OK',
  open => {
    const onClose = jest.fn();
    const error = shallow(
      <ErrorDialog
        open={open}
        errors={[new Error('Network failed')]}
        onClose={onClose}
      />,
    );
    expect(error.find(Dialog).prop('open')).toBe(open);
    expect(error.find('li').text()).toContain('Network failed');
    error.find(Button).simulate('click');
    expect(onClose).toHaveBeenCalledTimes(1);
    const detail = shallow(
      <AnnotationDetailDialog
        open={open}
        annotations={[9999]}
        onClose={onClose}
      />,
    );
    expect(detail.find(Dialog).prop('open')).toBe(open);
    expect(detail.find('.reminder').first().text()).toContain('9999');
    detail.find(Button).simulate('click');
    expect(onClose).toHaveBeenCalledTimes(2);
  },
);
test('publishing dialog edits metadata, preserves release options and supports Back', () => {
  const quest = { id: 'q', metadataRealtime: new EditableMap('meta', {}) };
  const props = {
    quest,
    user: loggedOutUser,
    open: true,
    onClose: jest.fn(),
    onRequestPublish: jest.fn(),
    handleMetadataChange: jest.fn(),
  };
  const view = shallow(<PublishingDialog {...props} />);
  expect(view.find(Dialog).prop('open')).toBe(true);
  const checkbox = (label: string) =>
    view.find(Checkbox).filterWhere(c => c.prop('label').includes(label));
  checkbox('Future').prop('onChange')(true);
  expect(props.handleMetadataChange).toHaveBeenCalledWith(quest, {
    expansionfuture: true,
  });
  checkbox('Major release').prop('onChange')(true);
  checkbox('Publish privately').prop('onChange')(true);
  view
    .find(Button)
    .filterWhere(b => b.prop('children') === 'Publish')
    .simulate('click');
  expect(props.onRequestPublish).toHaveBeenCalledWith(quest, true, true);
  view
    .find(Button)
    .filterWhere(b => b.prop('children') === 'Back')
    .simulate('click');
  expect(props.onClose).toHaveBeenCalledTimes(1);
  view.setProps({ open: false });
  expect(view.find(Dialog).prop('open')).toBe(false);
});
test('routes each dialog close callback to its own ID', () => {
  const onClose = jest.fn();
  const view = shallow(
    <Dialogs
      dialogs={{ open: { ERROR: true }, errors: [], annotations: [] } as any}
      quest={{}}
      user={loggedOutUser}
      onClose={onClose}
      onRequestPublish={jest.fn()}
      handleMetadataChange={jest.fn()}
    />,
  );
  view.find(ErrorDialog).prop('onClose')();
  expect(onClose).toHaveBeenLastCalledWith('ERROR');
  view.find(AnnotationDetailDialog).prop('onClose')();
  expect(onClose).toHaveBeenLastCalledWith('ANNOTATION_DETAIL');
  view.find(PublishingDialog).prop('onClose')();
  expect(onClose).toHaveBeenLastCalledWith('PUBLISHING');
});
