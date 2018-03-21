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
}

export interface QuestsViewDispatchProps {
}

export interface QuestsViewProps extends QuestsViewStateProps, QuestsViewDispatchProps {}

const QuestsView = (props: QuestsViewProps): JSX.Element => {

  const rows = props.list.map((entry, i) => {
    return (
      <TableRow key={i}>
        <TableRowColumn>{entry.partition}</TableRowColumn>
        <TableRowColumn>{entry.title}</TableRowColumn>
        <TableRowColumn>{entry.visibility}</TableRowColumn>
        <TableRowColumn>{entry.ratingavg}/5 ({entry.ratingcount})</TableRowColumn>
        <TableRowColumn>{entry.user.email}</TableRowColumn>
      </TableRow>
    );
  });

  return (
    <Table>
      <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
        <TableRow>
          <TableHeaderColumn>Partition</TableHeaderColumn>
          <TableHeaderColumn>Title</TableHeaderColumn>
          <TableHeaderColumn>Visibility</TableHeaderColumn>
          <TableHeaderColumn>Rating</TableHeaderColumn>
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
