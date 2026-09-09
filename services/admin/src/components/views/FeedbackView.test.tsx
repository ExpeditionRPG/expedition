import * as React from 'react';
import { shallow } from 'enzyme';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import FeedbackView from './FeedbackView';
test('renders real rows, selection and empty results, and opens selected details', () => {
  const onRowSelect = jest.fn();
  const entry = {
    partition: 'public',
    quest: { title: 'Adventure' },
    suppressed: true,
    rating: 2,
    text: 'Feedback',
    user: { email: 'player@example.com' },
  };
  const wrapper = shallow(
    <FeedbackView list={[entry]} selected={0} onRowSelect={onRowSelect} />,
  );
  const row = wrapper.find(TableBody).find(TableRow);
  expect(row.prop('selected')).toBe(true);
  expect(
    row
      .find(TableCell)
      .map(cell => String(cell.prop('children') ?? ''))
      .join(' '),
  ).toContain('Feedback');
  row.simulate('click');
  expect(onRowSelect).toHaveBeenCalledWith(0);
  wrapper.setProps({ list: [] });
  expect(wrapper.find(TableBody).find(TableRow)).toHaveLength(0);
});
