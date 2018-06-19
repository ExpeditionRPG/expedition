import * as React from 'react'

import {FeedbackEntry} from 'expedition-api/app/admin/QueryTypes'
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from '@material-ui/core/Table';

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
        <TableRowColumn>{entry.partition}</TableRowColumn>
        <TableRowColumn>{entry.quest.title}</TableRowColumn>
        <TableHeaderColumn className="smallColumn">{entry.suppressed ? 'X' : ''}</TableHeaderColumn>
        <TableRowColumn className="smallColumn">{entry.rating}</TableRowColumn>
        <TableRowColumn>{entry.text}</TableRowColumn>
        <TableRowColumn>{entry.user.email}</TableRowColumn>
      </TableRow>
    );
  });

  return (
    <Table onCellClick={(rowNumber: number) => {props.onRowSelect(rowNumber);}} selectable={false}>
      <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
        <TableRow>
          <TableHeaderColumn>Partition</TableHeaderColumn>
          <TableHeaderColumn>Quest</TableHeaderColumn>
          <TableHeaderColumn className="smallColumn">Suppressed</TableHeaderColumn>
          <TableHeaderColumn className="smallColumn">Rating</TableHeaderColumn>
          <TableHeaderColumn>Text</TableHeaderColumn>
          <TableHeaderColumn>Email</TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody displayRowCheckbox={false} deselectOnClickaway={true}>
        {rows}
      </TableBody>
    </Table>
  );
};

export default FeedbackView;
