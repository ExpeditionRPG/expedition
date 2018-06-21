import * as React from 'react'

import AppBar from '@material-ui/core/AppBar'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar'

import AlertWarning from '@material-ui/icons/Warning'
import NavigationArrowDropDown from '@material-ui/icons/ArrowDropDown'
import SyncIcon from '@material-ui/icons/Sync'

import {UserState, ViewState, ViewType} from '../reducers/StateTypes'

//TODO INCLUDE VERSION

export interface TopBarStateProps {
  view: ViewState;
  user: UserState;
};

export interface TopBarDispatchProps {
  onUserDialogRequest: (user: UserState)=>void;
  onFilterUpdate: (view: ViewType, filter: string)=>void;
}

interface TopBarProps extends TopBarStateProps, TopBarDispatchProps {}

const FILTER_DEBOUNCE = 750;
export interface FilterProps {
  onFilterUpdate: (filter: string) => any;
}
export class Filter extends React.Component<FilterProps, {filter: string, lastFilter: string, debounce: number|null}> {
  constructor(props: FilterProps) {
    super(props);
    this.state = {
      filter: '',
      lastFilter: '',
      debounce: null,
    };
  }

  sendUpdate() {
    console.log(this.state);
    if (!this.state.debounce) {
      if (this.state.filter === this.state.lastFilter) {
        return;
      }
      this.props.onFilterUpdate(this.state.filter);
      this.setState({
        lastFilter: this.state.filter,
        debounce: setTimeout(() => {
          this.setState({debounce: null});
          this.sendUpdate();
        }, FILTER_DEBOUNCE) as any as number,
      });
    }
  }

  handleFilterChange(event: React.FormEvent<HTMLInputElement>) {
    this.setState({filter: event.currentTarget.value}, () => this.sendUpdate());
  }

  render(): JSX.Element {
    return (
      <TextField id="filter" value={this.state.filter} onChange={this.handleFilterChange.bind(this)} />
    );
  }
}


const TopBar = (props: TopBarProps): JSX.Element => {
  const loginText = 'Logged in as ' + props.user.displayName;
  const title = props.view.view;

  let warn = <span/>;
  if (props.view.lastQueryError && props.view.lastQueryError.view === props.view.view) {
    // TODO tooltip={props.view.lastQueryError.error.toString()}
    warn = <Button><AlertWarning/></Button>;
  }

  /* TODO Menu attached to nav arrow drop down

  <IconMenu
              className="loginState"
              ButtonElement={

              }
              targetOrigin={{horizontal: 'right', vertical: 'top'}}
              anchorOrigin={{horizontal: 'right', vertical: 'top'}}
            >
              <MenuItem disabled={true}>{loginText}</MenuItem>
              <MenuItem onClick={() => props.onUserDialogRequest(props.user)}>Sign Out</MenuItem>
            </IconMenu>

  */
  return (
    <span className="quest_app_bar">
      <AppBar
        title={title}
        iconElementRight={
          <div className="appBarRight">
            <span className="email">{props.user.email}</span>
            <Button><NavigationArrowDropDown /></Button>
          </div>
        }
      />
      <Toolbar className="toolbar">
        <Filter onFilterUpdate={(f: string) => {props.onFilterUpdate(props.view.view, f);}}/>
        {warn}
        <Button onClick={(event: any) => {console.log('TODO');}}>Help</Button>
      </Toolbar>
    </span>
  );
}

export default TopBar;
