import * as React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

import {UserEntry} from '@expedition-api/app/admin/QueryTypes'

export interface UsersViewStateProps {
  list: UserEntry[];
  selected: number|null;
}

export interface UsersViewDispatchProps {
  onRowSelect: (row: number) => any;
}

export interface UsersViewProps extends UsersViewStateProps, UsersViewDispatchProps {}

const UsersView = (props: UsersViewProps): JSX.Element => {

  const rows = props.list.map((entry, i) => {
    return (
      <TableRow key={i} selected={i === props.selected}>
        <TableCell>{entry.email}</TableCell>
        <TableCell>{entry.name}</TableCell>
        <TableCell className="smallColumn">{entry.loot_points}</TableCell>
        <TableCell>{entry.last_login.toISOString()}</TableCell>
      </TableRow>
    );
  });

  return (
    <Table onCellClick={(rowNumber: number) => {props.onRowSelect(rowNumber);}} selectable={false}>
      <TableHead displaySelectAll={false} adjustForCheckbox={false}>
        <TableRow>
          <TableCell>Email</TableCell>
          <TableCell>Name</TableCell>
          <TableCell className="smallColumn">Loot Points</TableCell>
          <TableCell>Last Login</TableCell>
        </TableRow>
      </TableHead>
      <TableBody displayRowCheckbox={false}>
        {rows}
      </TableBody>
    </Table>
  );
};

export default UsersView;
