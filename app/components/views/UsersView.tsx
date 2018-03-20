import * as React from 'react'

import {UserEntry} from '../../reducers/StateTypes'
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
}

export interface UsersViewDispatchProps {
}

export interface UsersViewProps extends UsersViewStateProps, UsersViewDispatchProps {}

const UsersView = (props: UsersViewProps): JSX.Element => {

  const rows = props.list.map((entry, i) => {
    return (
      <TableRow key={i}>
        <TableRowColumn>{entry.email}</TableRowColumn>
        <TableRowColumn>{entry.name}</TableRowColumn>
        <TableRowColumn>{entry.loot_points}</TableRowColumn>
        <TableRowColumn>{entry.last_login.toISOString()}</TableRowColumn>
      </TableRow>
    );
  });

  return (
    <Table>
      <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
        <TableRow>
          <TableHeaderColumn>Email</TableHeaderColumn>
          <TableHeaderColumn>Name</TableHeaderColumn>
          <TableHeaderColumn>Loot Points</TableHeaderColumn>
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
