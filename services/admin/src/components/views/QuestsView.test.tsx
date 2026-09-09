import * as React from 'react';
import { shallow } from 'enzyme';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import QuestsView from './QuestsView';
test('renders real rows, selection and empty results, and opens selected details', () => {
  const onRowSelect = jest.fn();
  const entry = {
    partition: 'public',
    title: 'Adventure',
    published: true,
    ratingavg: null,
    ratingcount: 0,
    user: { email: 'author@example.com' },
  };
  const wrapper = shallow(
    <QuestsView list={[entry]} selected={0} onRowSelect={onRowSelect} />,
  );
  const row = wrapper.find(TableBody).find(TableRow);
  expect(row.prop('selected')).toBe(true);
  expect(
    row
      .find(TableCell)
      .map(cell => String(cell.prop('children') ?? ''))
      .join(' '),
  ).toContain('Adventure');
  row.simulate('click');
  expect(onRowSelect).toHaveBeenCalledWith(0);
  wrapper.setProps({ list: [] });
  expect(wrapper.find(TableBody).find(TableRow)).toHaveLength(0);
});
