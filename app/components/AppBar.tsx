import React from 'react'
import IconButton from 'material-ui/IconButton'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'

import HelpOutline from 'material-ui/svg-icons/action/help-outline'

export interface AppBarStateProps {
  filters: any;
}

export interface AppBarDispatchProps {
  handleFilterChange: (name: string, value: string | number) => void;
}

export interface AppBarProps extends AppBarStateProps, AppBarDispatchProps {};

class AppBar extends React.Component<AppBarProps, {}> {
  render() {
    const filters = Object.keys(this.props.filters).map((name: string, index: number) => {
      const filter = this.props.filters[name];
      const options = this.props.filters[name].options.map((option: any, index: number) => {
        if (typeof option === 'string' && option.toLowerCase() === 'all') {
          const allName = 'All ' + name + ((['s', 'x'].indexOf(name[name.length-1]) !== -1) ? 'es' : 's');
          return <MenuItem key={index} value={option} primaryText={allName} />
        }
        return <MenuItem key={index} value={option} primaryText={option} />
      });
      return (
        <SelectField
          key={index}
          value={this.props.filters[name].current}
          floatingLabelText={name}
          onChange={(e, i, v) => { this.props.handleFilterChange(name, v); }}
          style={{width: 'auto', minWidth: 80, maxWidth: 250}}
        >
          {options}
        </SelectField>
      );
    });
    return (
      <Toolbar>
        <ToolbarGroup>
          <ToolbarTitle text="Expedition Card Creator" />
        </ToolbarGroup>
        <ToolbarGroup lastChild={true}>
          <div id="filters">
            <span id="dynamicFilters"></span>
          </div>
          {filters}
          <IconButton tooltip="SVG Icon" onTouchTap={() => { window.open('https://github.com/Fabricate-IO/expedition-cards/blob/master/CARD-CREATION.md'); } }>
            <HelpOutline />
          </IconButton>
        </ToolbarGroup>
      </Toolbar>
    );
  }
}

export default AppBar;
