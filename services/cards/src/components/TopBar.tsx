import AppBar from '@material-ui/core/AppBar';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import AutoRenew from '@material-ui/icons/Autorenew';
import HelpOutline from '@material-ui/icons/HelpOutline';
import * as React from 'react';

import {FiltersState} from '../reducers/StateTypes';

export interface TopBarStateProps extends React.Props<any> {
  filters: FiltersState;
}

export interface TopBarDispatchProps {
  downloadCards: () => void;
  handleFilterChange: (name: string, value: string | number) => void;
  openHelp: () => void;
}

export interface TopBarProps extends TopBarStateProps, TopBarDispatchProps {}

class TopBar extends React.Component<TopBarProps, {}> {
  public render() {
    const filtersCurrent = Object.keys(this.props.filters).reduce((acc: any, name: string) => {
      acc[name] = this.props.filters[name].current;
      return acc;
    }, {});
    const filters = Object.keys(this.props.filters).map((name: string, index: number) => {
      const filter = this.props.filters[name];
      const options = filter.options.map((option: any, index: number) => {
        let text = option;
        // For "all" default values, nicen up their text presentation to users
        if (typeof option === 'string' && option.toLowerCase() === 'all') {
          text = 'All ' + name + ((['s', 'x'].indexOf(name[name.length - 1]) !== -1) ? 'es' : 's');
        // For sources, remove the ":LONGIDSTRING" and just show the user the name of the source
        } else if (name === 'source') {
          text = text.split(':')[0];
        }
        return <MenuItem key={index} value={option}>{text}</MenuItem>;
      });
      return (
        <FormControl>
          <InputLabel htmlFor={name}>{name}</InputLabel>
          <Select
            className="filter"
            key={index}
            value={filtersCurrent[name]}
            inputProps={{id: name}}
            onChange={(e: any) => { this.props.handleFilterChange(name, e.target.value); }}
            autoWidth={true}
          >
            {options}
          </Select>
        </FormControl>
      );
    });
    // TODO re-add toolips in new MaterialUI way, "Reload Card Data", tooltip="Help"
    return (
      <AppBar>
        <Toolbar className="printHide">
          <Typography variant="title">
            Expedition
          </Typography>
          {filters}
          <IconButton onClick={this.props.downloadCards}>
            <AutoRenew />
          </IconButton>
          <IconButton onClick={this.props.openHelp}>
            <HelpOutline />
          </IconButton>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
