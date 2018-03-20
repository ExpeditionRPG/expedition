import * as React from 'react'

import {FeedbackEntry} from '../../reducers/StateTypes'
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

export interface FeedbackViewStateProps {
  list: FeedbackEntry[];
}

export interface FeedbackViewDispatchProps {
}

export interface FeedbackViewProps extends FeedbackViewStateProps, FeedbackViewDispatchProps {}

const FeedbackView = (props: FeedbackViewProps): JSX.Element => {

  const rows = props.list.map((entry, i) => {
    return (
      <TableRow key={i}>
        <TableRowColumn>{entry.partition}</TableRowColumn>
        <TableRowColumn>{entry.quest.title}</TableRowColumn>
        <TableRowColumn>{entry.rating}</TableRowColumn>
        <TableRowColumn>{entry.text}</TableRowColumn>
        <TableRowColumn>{entry.user.email}</TableRowColumn>
      </TableRow>
    );
  });

  return (
    <Table>
      <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
        <TableRow>
          <TableHeaderColumn>Partition</TableHeaderColumn>
          <TableHeaderColumn>Quest</TableHeaderColumn>
          <TableHeaderColumn>Rating</TableHeaderColumn>
          <TableHeaderColumn>Text</TableHeaderColumn>
          <TableHeaderColumn>Email</TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody displayRowCheckbox={false}>
        {rows}
      </TableBody>
    </Table>
  );
};

export default FeedbackView;
