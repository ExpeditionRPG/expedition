import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import * as React from 'react';
import {toCard, toPrevious} from '../../actions/Card';
import {setDialog} from '../../actions/Dialog';
import {storeSavedQuest} from '../../actions/SavedQuests';
import {openSnackbar} from '../../actions/Snackbar';
import {URLS} from '../../Constants';
import {getDevicePlatform, openWindow} from '../../Globals';
import {CardThemeType} from '../../reducers/StateTypes';
import {getStore} from '../../Store';

// If onMenuSelect or onReturn is not set, default dispatch behavior is used.
export interface Props extends React.Props<any> {
  theme?: CardThemeType;
  header?: JSX.Element;
  icon?: string;
  inQuest?: boolean;
  onReturn?: () => any;
  title?: string | JSX.Element;
  className?: string;
}

export default class Card extends React.Component<Props, {}> {
  public state: {anchorEl: HTMLElement|undefined}; // undefined instead of null for MaterialUI typing

  constructor(props: Props) {
    super(props);
    this.state = {anchorEl: undefined};
  }

  public onReturn() {
    if (this.props && this.props.onReturn) {
      return this.props.onReturn();
    }
    getStore().dispatch(toPrevious({}));
  }

  public handleMenuClick(event: React.MouseEvent<HTMLElement>) {
    this.setState({anchorEl: event.currentTarget});
  }

  public handleMenuClose() {
    this.setState({anchorEl: undefined});
  }

  public onMenuSelect(value: string) {
    const dispatch = getStore().dispatch;
    this.handleMenuClose();
    switch (value) {
      case 'ABOUT':
        openWindow(URLS.WEBSITE);
        break;
      case 'HOME':
        if (!this.props.inQuest) {
          return dispatch(toPrevious({name: 'SPLASH_CARD', before: false}));
        }
        return dispatch(setDialog('EXIT_QUEST'));
      case 'SAVE':
        const state = getStore().getState();
        dispatch(storeSavedQuest(state.quest.node, state.quest.details, Date.now()));
        return dispatch(openSnackbar('Quest saved.'));
      case 'SETTINGS':
        return dispatch(toCard({name: 'SETTINGS'}));
      case 'RATE':
        let err: Error|null = null;
        switch (getDevicePlatform()) {
          case 'android':
            openWindow(URLS.android);
            break;
          case 'ios':
            openWindow(URLS.ios);
            break;
          case 'web':
            err = Error('Cannot rate web app');
            break;
          default:
            err = Error('Uknown platform encountered');
        }
        if (err) {
          throw err;
        }
        break;
      case 'FEEDBACK':
        return dispatch(setDialog('FEEDBACK'));
      case 'REPORT':
        return dispatch(setDialog('REPORT_QUEST'));
      default:
        throw new Error('Unknown menu option ' + value);
    }
  }

  public render() {
    const {anchorEl} = this.state;
    let icon: JSX.Element = <span></span>;
    if (this.props.icon) {
      icon = <img id="bgimg" src={'images/' + this.props.icon + '.svg'}></img>;
    }
    const state = getStore().getState();
    const isExperimental = state.settings.experimental;
    const cardTheme = this.props.theme || 'light';
    const questTheme = state.quest.details.theme || 'base';
    const hasReturn = state._history.length > 0;
    const classes = ['base_card', 'card_theme_' + cardTheme, 'quest_theme_' + questTheme];
    if (this.props.className) {
      classes.push(this.props.className);
    }
    // TODO: Position menu origin at top-right
    // TODO: Style menuStyle={{background: '#f4ebcc'}}
    return (
      <div className={classes.join(' ')}>
        <div className="title_container">
          {hasReturn && <IconButton id="titlebarReturnButton" onClick={() => this.onReturn()}><ChevronLeftIcon/></IconButton>}
          <span className="menu">
            <IconButton id="menuButton" aria-haspopup="true" onClick={(e) => this.handleMenuClick(e)}>
              <MoreVertIcon/>
            </IconButton>
            <Menu
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              classes={{paper: 'menu_popup'}}
              onClose={() => this.handleMenuClose()}>
              <MenuItem id="homeButton" onClick={() => {this.onMenuSelect('HOME'); }}>Home</MenuItem>
              {this.props.inQuest && isExperimental && <MenuItem onClick={() => {this.onMenuSelect('SAVE'); }}>Save quest</MenuItem>}
              <MenuItem onClick={() => {this.onMenuSelect('SETTINGS'); }}>Settings</MenuItem>
              {getDevicePlatform() !== 'web' && <MenuItem onClick={() => {this.onMenuSelect('RATE'); }}>Rate the App</MenuItem>}
              <MenuItem onClick={() => {this.onMenuSelect('FEEDBACK'); }}>Send Feedback</MenuItem>
              {this.props.inQuest && <MenuItem onClick={() => {this.onMenuSelect('REPORT'); }}>Report quest</MenuItem>}
              {!this.props.inQuest && <MenuItem onClick={() => {this.onMenuSelect('ABOUT'); }}>About</MenuItem>}
              <MenuItem onClick={() => openWindow('https://expeditiongame.com/store?utm_source=app')}>Shop</MenuItem>
            </Menu>
          </span>
          <div className="title">{this.props.title}</div>
        </div>
        {this.props.header && <div className="header">{this.props.header}</div>}
        <div className="article">
          <div className="scrollbox">
            <div className="scrollbox_top">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 15.5 1.2">
                <path className="st0" d="M6.9,0.8c0.1,0,0.2-0.1,0.2,0c0,0,0,0,0.1-0.1c0,0,0.1,0,0.2,0c-0.1,0-0.1,0-0.3,0C7,0.8,6.7,0.8,6.6,0.9C6.7,0.8,6.8,0.9,6.9,0.8z"/>
                <path className="st0" d="M7.6,0.8L7.6,0.8C7.6,0.8,7.6,0.8,7.6,0.8C7.4,0.9,7.4,0.9,7.4,0.9L7.6,0.8z"/>
                <path className="st1" d="M8.4,0.9C8.3,0.9,8.5,0.9,8.4,0.9c0,0,0.2,0.1,0.3,0.1h0.1C8.7,0.9,8.4,0.9,8.2,0.8C8.2,0.8,8.3,0.8,8.4,0.9C8.3,0.9,8.4,0.9,8.4,0.9z"/>
                <path className="st0" d="M8.6,0.9L8.6,0.9C8.6,0.9,8.4,0.9,8.6,0.9z"/>
                <path className="st0" d="M8.4,0.8C8.3,0.7,8.5,0.8,8.4,0.8C8.4,0.8,8.5,0.8,8.4,0.8z"/>
                <path className="st1" d="M9.1,1c0,0-0.1,0-0.2,0C8.8,1,8.7,1,8.7,1s0,0,0.1,0h0.1H9.1C9.1,1,9.1,1,9.1,1z"/>
                <path className="st1" d="M9.1,1.1C9.1,1.1,9,1,9.1,1.1c0.1,0,0.2,0,0.3,0H9.3c0,0,0.3,0,0.2,0.1c0.2,0-0.1-0.1,0.1-0.1C9.5,1.1,9.3,1,9.1,1.1h0.1c-0.1,0-0.3,0-0.4,0C8.9,1.1,9,1,9.1,1.1z"/>
                <path className="st1" d="M9.7,1.2c0.1,0,0.3,0,0.4,0c-0.1,0-0.2,0-0.2,0C9.9,1.1,9.7,1.1,9.7,1.2C9.8,1.1,9.7,1.1,9.7,1.2z"/>
                <path className="st1" d="M10.3,1.2L10.3,1.2L10.3,1.2L10.3,1.2c0-0.1,0,0-0.2,0C10.2,1.2,10.2,1.2,10.3,1.2z"/>
                <path className="st1" d="M10.3,1c0.1,0,0.1,0,0.2,0c-0.1,0-0.3,0-0.4,0l0,0c0,0-0.1,0-0.2,0C10.1,1,10.3,1.1,10.3,1z"/>
                <path className="st1" d="M10.1,1h0.1H10.1z"/>
                <polygon className="st1" points="10.7,1.2 10.5,1.2 10.5,1.2"/>
                <path className="st1" d="M10.4,1.1C10.6,1.1,10.3,1.1,10.4,1.1c0.1,0-0.2,0-0.2,0C10.3,1.1,10.4,1.1,10.4,1.1z"/>
                <path className="st1" d="M10.8,1.2H11H10.8z"/>
                <path className="st1" d="M11.2,1.2L11.2,1.2c0.2,0,0.4,0,0.5,0c0,0,0.1-0.1-0.1-0.1h-0.1c-0.1,0,0,0-0.1,0C11.4,1.2,11.2,1.2,11.2,1.2L11.2,1.2c-0.1,0-0.2-0.1-0.2,0C11,1.2,11.1,1.2,11.2,1.2z"/>
                <path className="st1" d="M11.2,1.1h-0.1H11.2C11.2,1,11.1,1,11.2,1.1c-0.1,0-0.2-0.1-0.2,0c-0.2,0-0.1,0-0.2,0h-0.1C10.9,1.1,11,1.1,11.2,1.1z"/>
                <path className="st1" d="M11.7,1.1L11.7,1.1L11.7,1.1c0.3,0,0.5,0.1,0.7,0s0.4,0,0.7-0.1C13.2,1,13,1,13,1c0-0.1,0.1,0,0.2,0c0,0-0.2,0-0.3,0s-0.1,0-0.1,0.1h-0.1c-0.2,0.1-0.3,0-0.5,0.1c-0.1,0,0.1,0,0.1,0h-0.1l0,0C12.1,1.2,11.8,1.2,11.7,1.1C11.7,1.1,11.7,1.1,11.7,1.1h-0.1l-0.2,0.1C11.5,1.1,11.7,1.1,11.7,1.1z"/>
                <path className="st1" d="M11.5,1c-0.2,0,0,0-0.2,0C11.3,1.1,11.4,1.1,11.5,1C11.5,1.1,11.5,1.1,11.5,1L11.5,1z"/>
                <path className="st0" d="M12.5,1L12.5,1c0.1,0,0.1,0,0.1,0C12.5,1,12.4,1.1,12.5,1z"/>
                <path className="st0" d="M12.9,1L12.9,1L12.9,1z"/>
                <path className="st1" d="M13.2,0.9c0.1,0,0,0-0.1,0C13.2,0.9,13.2,0.9,13.2,0.9z"/>
                <path className="st0" d="M13.8,0.9C13.7,0.9,13.7,0.9,13.8,0.9C13.8,0.9,13.9,0.9,13.8,0.9C13.8,0.9,13.9,0.8,13.8,0.9z"/>
                <path className="st1" d="M14.4,0.8C14.3,0.8,14.3,0.8,14.4,0.8C14.3,0.8,14.3,0.8,14.4,0.8z"/>
                <path className="st1" d="M12.2,1.2L12.2,1.2L12.2,1.2z"/>
                <path className="st1" d="M12.2,1.2L12.2,1.2L12.2,1.2z"/>
                <path className="st1" d="M13.5,1L13.5,1L13.5,1L13.5,1z"/>
                <path className="st1" d="M8,0.8L8,0.8L8,0.8L8,0.8z"/>
                <path className="st1" d="M8,0.8c0.1,0,0.1,0.1,0.3,0.1C8.2,0.9,8.1,0.9,8,0.8C7.9,0.8,8.2,0.8,8,0.8z"/>
                <path className="st1" d="M9.9,1.1L9.9,1.1L9.9,1.1z"/>
                <polygon className="st0" points="1.8,0.8 1.8,0.8 1.7,0.8"/>
                <path className="st0" d="M1.8,0.8L1.8,0.8c0.2,0,0.2,0,0.2,0S1.9,0.9,1.8,0.8c-0.1,0-0.3,0-0.4-0.1C1.2,0.7,1.1,0.6,1,0.5c-0.1,0-0.1,0-0.1-0.1l0,0l0,0c0,0,0.2,0.1,0.5,0.2C1.6,0.8,1.8,0.8,1.8,0.8z"/>
                <path className="st0" d="M1.9,0.8c0.1,0,0.2,0.1,0.3,0.1C2.1,0.9,2,0.9,1.9,0.8L1.9,0.8z"/>
                <path className="st2" d="M2.3,0.8c0.1,0,0.1,0,0.2,0C2.5,0.9,2.4,0.9,2.3,0.8z"/>
                <path className="st1" d="M2.5,0.8L2.5,0.8L2.5,0.8L2.5,0.8z"/>
                <path className="st1" d="M2.5,0.8L2.5,0.8L2.5,0.8z"/>
                <path className="st1" d="M2.5,0.8C2.6,0.8,2.6,0.8,2.5,0.8L2.5,0.8c0.1,0,0.2,0,0.2,0C2.6,0.7,2.6,0.8,2.5,0.8c0.1,0,0.1,0,0.2,0h0.1C2.7,0.9,2.7,0.8,2.5,0.8z"/>
                <path className="st2" d="M2.9,0.8L2.9,0.8C2.8,0.8,2.9,0.8,2.9,0.8z"/>
                <path className="st1" d="M3.1,0.9C3.1,0.9,3,0.9,3.1,0.9C3,0.9,3,0.9,3,0.9C3.1,0.9,3,0.8,3.1,0.9z"/>
                <path className="st1" d="M3,0.9C3,0.9,2.9,0.9,3,0.9C2.9,0.9,3,0.9,3,0.9z"/>
                <path className="st2" d="M1.6,0.7L1.6,0.7L1.6,0.7z"/>
                <path className="st1" d="M3.4,0.9L3.4,0.9C3.4,1,3.4,1,3.4,0.9L3.4,0.9z"/>
                <path className="st1" d="M0,0L0,0C0.1-0.1,0.1,0,0,0c0.2,0.1,0.3,0.1,0.4,0.2c0.3,0.2,0.5,0.3,0.4,0.2H0.7h0.1C0.9,0.5,1,0.6,1.1,0.6c0,0-0.2-0.1-0.5-0.2c0-0.1-0.1-0.2-0.2-0.2C0.3,0.1,0.3,0.1,0.3,0.1s0.1,0,0.2,0.1c0,0,0.2,0.1,0.4,0.2c0.3,0.2,0.7,0.3,0.7,0.3l0,0c0.2,0,0.3,0,0.5,0.1l0,0c-0.1,0-0.1,0-0.3,0c0.3,0,0.3,0.1,0.5,0.1c0,0-0.1-0.1,0.1,0c0,0-0.2,0,0,0c0.2,0.1,0.2,0,0.4,0H2.7c0.1,0,0.2,0,0.3,0.1C2.9,1,2.7,1,2.7,1C2.8,1,3,1.1,3,1.1l0,0c0.1,0,0.1,0,0.2,0c0.1,0,0,0,0-0.1c0,0,0.2,0.1,0.3,0c0-0.1-0.2,0-0.3-0.1c0,0,0,0,0.1,0h0.1c0.1,0-0.3,0-0.2-0.1c0.1,0,0.3,0.1,0.4,0C3.3,1,3.1,1,3.1,0.9c0.1,0,0.1,0,0.3,0h0.1c0.1,0,0,0,0,0C3.7,1,4.1,0.9,4.4,1c0.2,0,0,0,0.1,0s0.3,0,0.4,0H5H4.9C4.8,1,4.8,1,4.8,1s0,0-0.1,0c0.1,0.1-0.3-0.1-0.4,0l0,0c0,0-0.1,0-0.2,0C3.9,0.9,3.8,0.9,3.8,0.9l0,0c0,0-0.3,0-0.4,0c0.1,0,0.3,0,0.2,0c0.1,0,0.3,0,0.6,0l0,0c0.2,0,0.5,0,0.8,0H4.9c0.1,0,0.2,0,0.3,0c-0.1,0-0.1,0,0,0c0.2,0,0.4,0,0.6,0l0,0H6c0.1,0,0.1,0,0.2,0h0.1c0,0,0,0-0.1,0c0.1-0.1,0.1,0,0.2,0c-0.1,0,0,0,0,0.1c0.2,0,0-0.1,0-0.1c0.2,0,0.2,0,0.4,0c0,0-0.1,0-0.2,0c0.1,0,0.1,0,0.1,0H6.6c0.2,0,0.4-0.1,0.6-0.1l0,0c0,0,0,0,0.1,0h0.1l0,0h0.1l0,0l0,0l0,0l0,0l0,0l0,0l0,0h0.1l0,0l0,0l0.1-0.3l0,0l0,0l0,0c0,0,0,0,0.1,0h0.1c0,0,0,0,0.1,0l0,0l0,0h0.1c0.1,0,0.1,0,0.2,0c0,0-0.1,0-0.2,0H8l0,0l0,0l0,0h0.1c0,0,0,0,0.1,0h0.1c0,0,0,0-0.1,0c0.2,0,0.4,0.1,0.5,0.1c0,0,0,0-0.1,0H8.5c0.1,0.1,0.2,0.2,0.2,0.2H8.6c0.2,0,0.4,0,0.5,0.1H8.9H9c0.2,0,0-0.1,0.3,0l0,0c0.1,0,0.4,0,0.3,0H9.5l0,0c0,0,0.1,0,0.2,0c0.1,0,0.2,0,0.2,0H10h0.1c0.1,0-0.2,0-0.2,0.1H10C9.7,1.1,9.7,1,9.5,1H9.4l0,0C9.3,1,9.3,1,9.3,1C9.2,0.9,9,1,8.8,0.9c0.2,0-0.1-0.1-0.1-0.1c-0.1,0-0.3,0-0.4-0.1c-0.1,0,0.1,0,0,0s-0.1,0-0.1,0c-0.1,0-0.1,0-0.2,0H7.9H7.8c-0.1,0-0.1,0-0.2,0H7.5l0,0c-0.1,0-0.3,0.1-0.3,0.1l0,0C7.1,0.8,7,0.9,6.8,0.9c0,0,0.1,0,0.2,0l0,0c0.2,0,0.5-0.1,0.7-0.2L7.6,0.8c0.1,0,0.1-0.1,0.2-0.1l0,0c0.1,0,0,0,0,0s-0.1,0,0,0s0,0.1,0.1,0.1c-0.1,0-0.1,0-0.2,0c0,0,0,0-0.1,0H7.5c0.1,0.1,0,0.1,0,0.1C7.3,0.9,7.2,1,7.1,1C6.8,1,6.6,1.1,6.3,1.1l0,0c-0.1,0-0.5,0.1-1,0.1c-0.4,0-0.8,0-0.9,0c0,0,0.1,0-0.1,0l0,0C4,1.1,3.6,1.2,3.2,1.1H3.1C3,1,2.8,1.1,2.6,1l0,0c0,0-0.1,0-0.2,0C2.3,1,2.2,1,2.2,1s0,0,0.1,0C2.2,1,2.2,1,2.2,1s0,0-0.1,0H2c0.1,0-0.1-0.1-0.4-0.2S1.1,0.7,0.8,0.5c-0.1,0-0.2,0-0.3-0.1l0,0l0,0c-0.1-0.1,0,0-0.1-0.1c-0.1,0,0,0,0.1,0.1c0.1,0,0,0,0,0C0.3,0.3,0.1,0.1,0,0"/>
                <path className="st1" d="M15.5,0.1c-0.1,0.1-0.2,0.2-0.3,0.3c-0.2,0.2-0.5,0.3-0.7,0.4c-0.1,0-0.1,0-0.3,0.1l0,0c-0.1,0-0.3,0.1-0.4,0.1l0,0c-0.2,0.1-0.3,0-0.4,0.1c0.1,0-0.1,0,0,0c-0.2,0-0.2,0-0.3,0l0,0c-0.2,0-0.5,0.1-0.5,0.1h-0.1c-0.1,0-0.1,0-0.2,0c-0.1,0,0,0,0,0s-0.2,0-0.3,0c0,0,0.2,0,0.3,0l0,0c0.5-0.1,0.9,0,1.3-0.1c0.1-0.1,0.1-0.2,0.2-0.2c0,0-0.1,0-0.2,0c-0.1,0-0.1,0-0.1,0.1c0,0,0,0-0.1,0h-0.1h-0.1c0.1,0,0.2-0.1,0.1-0.1c0.2-0.1,0,0.1,0.2,0.1l0,0c0,0,0.1,0,0.2,0l0,0c0.3-0.1,0.6-0.2,0.9-0.3c0.3-0.1,0.6-0.3,0.8-0.6C15.5,0.1,15.5,0.1,15.5,0.1"/>
              </svg>
            </div>
            <div className="child_wrapper">
              {this.props.children}
            </div>
          </div>
          {icon}
        </div>
      </div>
    );
  }
}
