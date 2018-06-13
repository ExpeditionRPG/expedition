import * as React from 'react'

import {UserEntry} from 'expedition-api/app/admin/QueryTypes'
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

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
        <TableRowColumn>{entry.email}</TableRowColumn>
        <TableRowColumn>{entry.name}</TableRowColumn>
        <TableRowColumn className="smallColumn">{entry.loot_points}</TableRowColumn>
        <TableRowColumn>{entry.last_login.toISOString()}</TableRowColumn>
      </TableRow>
    );
  });

  return (
    <Table onCellClick={(rowNumber: number) => {props.onRowSelect(rowNumber);}} selectable={false}>
      <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
        <TableRow>
          <TableHeaderColumn>Email</TableHeaderColumn>
          <TableHeaderColumn>Name</TableHeaderColumn>
          <TableHeaderColumn className="smallColumn">Loot Points</TableHeaderColumn>
          <TableHeaderColumn>Last Login</TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody displayRowCheckbox={false}>
        {rows}
      </TableBody>
    </Table>
  );
};

export default UsersView;
