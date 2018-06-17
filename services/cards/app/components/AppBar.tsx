import * as React from 'react'
import IconButton from 'material-ui/IconButton'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'
import AutoRenew from 'material-ui/svg-icons/action/autorenew'
import HelpOutline from 'material-ui/svg-icons/action/help-outline'

import {FiltersState} from '../reducers/StateTypes'

export interface AppBarStateProps {
  filters: FiltersState;
}

export interface AppBarDispatchProps {
  downloadCards: () => void;
  handleFilterChange: (name: string, value: string | number) => void;
  openHelp: () => void;
}

export interface AppBarProps extends AppBarStateProps, AppBarDispatchProps {};

class AppBar extends React.Component<AppBarProps, {}> {
  render() {
    const filtersCurrent = Object.keys(this.props.filters).reduce((acc: any, name: string) => {
      acc[name] = this.props.filters[name].current;
      return acc;
    }, {});
    const filters = Object.keys(this.props.filters).map((name: string, index: number) => {
      const filter = this.props.filters[name];
      const options = this.props.filters[name].options.map((option: any, index: number) => {
        let text = option;
        // For "all" default values, nicen up their text presentation to users
        if (typeof option === 'string' && option.toLowerCase() === 'all') {
          text = 'All ' + name + ((['s', 'x'].indexOf(name[name.length-1]) !== -1) ? 'es' : 's');
        // For sources, remove the ":LONGIDSTRING" and just show the user the name of the source
        } else if (name === 'source') {
          text = text.split(':')[0];
        }
        return <MenuItem key={index} value={option} primaryText={text} />
      });
      return (
        <SelectField
          className="filter"
          key={index}
          value={filtersCurrent[name]}
          floatingLabelText={name}
          onChange={(e, i, v) => { this.props.handleFilterChange(name, v); }}
          autoWidth={true}
        >
          {options}
        </SelectField>
      );
    });
    return (
      <Toolbar className="printHide appbar">
        <ToolbarGroup>
          <ToolbarTitle text="Expedition" />
        </ToolbarGroup>
        <ToolbarGroup lastChild={true}>
          {filters}
          <IconButton tooltip="Reload Card Data" onClick={this.props.downloadCards}>
            <AutoRenew />
          </IconButton>
          <IconButton tooltip="Help" onClick={this.props.openHelp}>
            <HelpOutline />
          </IconButton>
        </ToolbarGroup>
      </Toolbar>
    );
  }
}

export default AppBar;
