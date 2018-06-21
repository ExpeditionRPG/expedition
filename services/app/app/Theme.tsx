import {createMuiTheme} from '@material-ui/core/styles'
// import deepOrange from '@material-ui/core/colors/deepOrange'
// import lightGreen from '@material-ui/core/colors/lightGreen'
// import grey from '@material-ui/core/colors/grey'
import spacing from '@material-ui/core/styles/spacing'

// const darkBlack = '0x000000';

// TODO FIXME
export default createMuiTheme({
  spacing: spacing,
  typography: {
    fontFamily: 'MinionPro, serif',
  },
  palette: {
    // primary1Color: grey[100],
    // primary2Color: grey[300],
    // primary3Color: grey[700],
    // accent1Color: lightGreen[700],
    // accent2Color: lightGreen[900],
    // accent3Color: lightGreen[300],
    // textColor: darkBlack,
    // alternateTextColor: darkBlack,
    // secondaryTextColor: darkBlack,
    // canvasColor: grey[100],
    // borderColor: grey[300],
    // disabledColor: fade(grey100, 0.3),
    // pickerHeaderColor: deepOrange[700],
    // clockCircleColor: fade(darkBlack, 0.07),
    // shadowColor: darkBlack,
  },
  /*
  checkbox: {
    checkedColor: darkBlack,
  },
  raisedButton: {
    primaryColor: grey[100],
  },
  */
  vw: {
    huge: '12vw',
    large: '6vw',
    base: '2vw',
    small: '1vw',
    tiny: '0.5vw',
  },
  vh: {
    huge: '12vh',
    large: '6vh',
    base: '2vh',
    small: '1vh',
    tiny: '0.5vh',
  },
  icon: {
    width: '0.15in',
    size: '7vw',
    arrowSize: '8vw',
  },
  fontSize: {
    interactive: '5.5vw',
    flavortext: '4.7vw',
    title: '6.2vw',
  },
  card: {
    width: '3in',
    height: '5in',
    contentHeight: '3in',
    footerHeight: '0.4in',
    headerFont: 'CinzelBold, serif',
    fontBoldWeight: 700,
  },
  border: {
    primary: '0.03in solid #000000',
    accent: '0.03in solid #CCCCCC',
    faded: '0.03in solid #777777',
  },
  inlineIcon: {
    width: '5vw',
    marginBottom: '-0.5vw',
  },
  colors: {
    // TODO: Consolidate this with the palette
    fontColorPrimary: '#000000',
    fontColorFaded: '#666666',
    fontColorDarkPrimary: '#FFFFFF',

    backgroundColorPrimary: '#FFFFFF',
    backgroundColorAccent: 'rgb(220, 220, 220)',
    backgroundColorInteractive: 'rgba(255, 255, 255, 0.7)', /* Clickable */
    backgroundColorActive: 'rgba(255, 255, 255, 0.9)', /* Clicked */
    backgroundColorDarkPrimary: 'rgb(20, 20, 20)',
    backgroundColorDarkAccent: 'rgb(60, 60, 60)',
    backgroundColorDarkInteractive: 'rgba(0, 0, 0, 0.7)',
    backgroundColorDarkActive: 'rgba(30, 30, 30, 1.0)',
    backgroundColorSurgePrimary: '#CC0000',
  }
} as any); // TODO: Remove this any type
