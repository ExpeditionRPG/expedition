import * as React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

import {QuestEntry} from '@expedition-api/app/admin/QueryTypes'

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
        <TableCell>{entry.partition}</TableCell>
        <TableCell>{entry.title}</TableCell>
        <TableCell className="smallColumn">{(entry.published) ? 'X' : ''}</TableCell>
        <TableCell className="smallColumn">{(entry.ratingavg === null) ? 'None' : (entry.ratingavg + ' (' + entry.ratingcount + ')')}</TableCell>
        <TableCell>{entry.user.email}</TableCell>
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
