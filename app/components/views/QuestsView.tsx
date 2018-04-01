import * as React from 'react'

import {QuestEntry} from 'expedition-api/app/admin/QueryTypes'
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

export interface QuestsViewStateProps {
  list: QuestEntry[];
  selected: number|null;
}

export interface QuestsViewDispatchProps {
  onRowSelect: (row: number) => any;
}

export interface QuestsViewProps extends QuestsViewStateProps, QuestsViewDispatchProps {}

const QuestsView = (props: QuestsViewProps): JSX.Element => {

  const rows = props.list.map((entry, i) => {
    return (
      <TableRow key={i} selected={i === props.selected}>
        <TableRowColumn>{entry.partition}</TableRowColumn>
        <TableRowColumn>{entry.title}</TableRowColumn>
        <TableRowColumn className="smallColumn">{(entry.published) ? 'X' : ''}</TableRowColumn>
        <TableRowColumn className="smallColumn">{(entry.ratingavg === null) ? 'None' : (entry.ratingavg + ' (' + entry.ratingcount + ')')}</TableRowColumn>
        <TableRowColumn>{entry.user.email}</TableRowColumn>
      </TableRow>
    );
  });

  return (
    <Table onCellClick={(rowNumber: number) => {props.onRowSelect(rowNumber);}} selectable={false}>
      <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
        <TableRow>
          <TableHeaderColumn>Partition</TableHeaderColumn>
          <TableHeaderColumn>Title</TableHeaderColumn>
          <TableHeaderColumn className="smallColumn">Published</TableHeaderColumn>
          <TableHeaderColumn className="smallColumn">Avg Rating</TableHeaderColumn>
          <TableHeaderColumn>Author</TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody displayRowCheckbox={false}>
        {rows}
      </TableBody>
    </Table>
  );
};

export default QuestsView;
