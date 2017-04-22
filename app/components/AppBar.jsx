import React from 'react'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'

import {defaultState, getStore} from '../Store.jsx'

export default class AppBar extends React.Component {

  handleFilterChange(name, value) {
    getStore().dispatch({type: 'FILTER_CHANGE', name, value});
  }

  render() {
    const props = this.props.props;
    const filters = Object.keys(props.filters).map((name, index) => {
      const filter = props.filters[name];
      const options = props.filters[name].options.map((option, index) => {
        if (typeof option === 'string' && option.toLowerCase() === 'all') {
          const allName = 'All ' + name + ((['s', 'x'].indexOf(name[name.length-1]) !== -1) ? 'es' : 's');
          return <MenuItem key={index} value={option} primaryText={allName} />
        }
        return <MenuItem key={index} value={option} primaryText={option} />
      });
      return (
        <SelectField
          key={index}
          value={props.filters[name].current}
          floatingLabelText={name}
          onChange={(e, i, v) => { this.handleFilterChange(name, v); }}
          style={{width: 'auto', minWidth: 80, maxWidth: 250}}
        >
          {options}
        </SelectField>
      );
    });
// TODO
// <button><a href="https://github.com/Fabricate-IO/expedition-cards/blob/master/CARD-CREATION.md" target="_blank">Help</a></button>
// <button><a href="https://expeditiongame.com/contact" target="_blank">Send Feedback</a></button>
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
        </ToolbarGroup>
      </Toolbar>
    );
  }
}
