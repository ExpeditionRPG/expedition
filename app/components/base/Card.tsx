import * as React from 'react'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import ChevronLeftIcon from 'material-ui/svg-icons/navigation/chevron-left'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import {getStore} from '../../store'
import {toCard, toPrevious} from '../../actions/card'
import theme from '../../theme'

// If onMenuSelect or onReturn is not set, default dispatch behavior is used.
interface ExpeditionCardProps extends React.Props<any> {
  onMenuSelect?: (value: string) => any;
  onReturn?: () => any;
  title?: string;
  icon?: string;
  dark?: boolean;
}

export default class ExpeditionCard extends React.Component<ExpeditionCardProps, {}> {

  onReturn() {
    if (this.props && this.props.onReturn) {
      return this.props.onReturn();
    }
    getStore().dispatch(toPrevious());
  }

  onMenuSelect(value: string) {
    if (this.props && this.props.onMenuSelect) {
      return this.props.onMenuSelect(value);
    }

    switch(value) {
      case 'HOME':
        return getStore().dispatch(toPrevious('SPLASH_CARD', undefined, false));
      case 'SETTINGS':
        return getStore().dispatch(toCard('SETTINGS'));
      case 'FEEDBACK':
        var url = 'http://www.expeditiongame.com/contact/?utm_source=webapp&utm_medium=app';
        window.open(url, '_system');
        break;
      default:
        throw new Error('Unknown menu option ' + value);
    }
  }

  render() {
    var icon: JSX.Element = <span></span>;
    if (this.props.icon) {
      icon = <img id="bgimg" src={"images/" + this.props.icon + ".svg"}></img>;
    }

    // TODO: Spacer ios-only as first child of card style
    // TODO: Add 'settings' and 'feedback' menu options.
    return (
      <div className={"base_card" + ((this.props.dark) ? " dark" : "")}>
        <div className="title_container">
            <IconButton onTouchTap={() => this.onReturn()}><ChevronLeftIcon/></IconButton>
            <span className="menu">
              <IconMenu
                iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                onChange={(event: any, value: string)=>this.onMenuSelect(value)}>
                  <MenuItem value="HOME" primaryText="Home"/>
                  <MenuItem value="SETTINGS" primaryText="Settings"/>
                  <MenuItem value="FEEDBACK" primaryText="Feedback"/>
              </IconMenu>
            </span>
            <div className="title">{this.props.title}</div>
        </div>
        <div className="article">
          <div className="scrollbox">
            <div className="scrollbox_top"/>
            {icon}
            <div className="child_wrapper">
              {this.props.children}
              <div className="scrollbox_bottom"/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
