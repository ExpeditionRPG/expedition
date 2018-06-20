import * as React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

import {FeedbackEntry} from '@expedition-api/app/admin/QueryTypes'

export interface FeedbackViewStateProps {
  list: FeedbackEntry[];
  selected: number|null;
}

export interface FeedbackViewDispatchProps {
  onRowSelect: (row: number) => any;
}

export interface FeedbackViewProps extends FeedbackViewStateProps, FeedbackViewDispatchProps {}

const FeedbackView = (props: FeedbackViewProps): JSX.Element => {

  const rows = props.list.map((entry, i) => {
    return (
      <TableRow key={i} selected={i === props.selected}>
        <TableCell>{entry.partition}</TableCell>
        <TableCell>{entry.quest.title}</TableCell>
        <TableCell className="smallColumn">{entry.suppressed ? 'X' : ''}</TableCell>
        <TableCell className="smallColumn">{entry.rating}</TableCell>
        <TableCell>{entry.text}</TableCell>
        <TableCell>{entry.user.email}</TableCell>
      </TableRow>
    );
  });

  return (
    <Table onCellClick={(rowNumber: number) => {props.onRowSelect(rowNumber);}} selectable={false}>
      <TableHead displaySelectAll={false} adjustForCheckbox={false}>
        <TableRow>
          <TableCell>Partition</TableCell>
          <TableCell>Quest</TableCell>
          <TableCell className="smallColumn">Suppressed</TableCell>
          <TableCell className="smallColumn">Rating</TableCell>
          <TableCell>Text</TableCell>
          <TableCell>Email</TableCell>
        </TableRow>
      </TableHead>
      <TableBody displayRowCheckbox={false} deselectOnClickaway={true}>
        {rows}
      </TableBody>
    </Table>
  );
};

export default FeedbackView;
