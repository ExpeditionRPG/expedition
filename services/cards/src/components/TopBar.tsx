import AppBar from '@material-ui/core/AppBar';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import AutoRenew from '@material-ui/icons/Autorenew';
import HelpOutline from '@material-ui/icons/HelpOutline';
import * as React from 'react';

import {FiltersState} from '../reducers/StateTypes';

export interface StateProps extends React.Props<any> {
  filters: FiltersState;
  printing: boolean;
}

export interface DispatchProps {
  downloadCards: (source: string) => void;
  handleFilterChange: (name: string, value: string | number) => void;
  openHelp: () => void;
}

export interface Props extends StateProps, DispatchProps {}

class TopBar extends React.Component<Props, {}> {
  public render() {
    if (this.props.printing) {
      return null;
    }

    const filtersCurrent = Object.keys(this.props.filters).reduce((acc: any, name: string) => {
      acc[name] = this.props.filters[name].current;
      return acc;
    }, {});
    const filters = Object.keys(this.props.filters).map((name: string, index: number) => {
      const filter = this.props.filters[name];
      const options = filter.options.map((option: any, j: number) => {
        let text = option;
        // For "all" default values, nicen up their text presentation to users
        if (typeof option === 'string' && option.toLowerCase() === 'all') {
          text = 'All ' + name + ((['s', 'x'].indexOf(name[name.length - 1]) !== -1) ? 'es' : 's');
        }
        return <MenuItem key={j} value={option}>{text}</MenuItem>;
      });
      if (name === 'source') {
        options.push(<MenuItem key="custom" value="custom">Custom</MenuItem>);
      }
      return (
        <FormControl key={index}>
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

    return (
      <AppBar className="printHide">
        <Toolbar>
          <Typography variant="title">
            Expedition
          </Typography>
          {filters}
          <Tooltip title="Reload card data">
            <IconButton onClick={() => this.props.downloadCards(this.props.filters.source.current)}>
              <AutoRenew />
            </IconButton>
          </Tooltip>
          <Tooltip title="Help">
            <IconButton onClick={this.props.openHelp}>
              <HelpOutline />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
    );
  }
}

export default TopBar;
