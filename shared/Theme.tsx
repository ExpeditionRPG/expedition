/* tslint:disable:object-literal-sort-keys */

// Shared Material-UI theming
// https://material-ui.com/customization/themes

// import deepOrange from '@material-ui/core/colors/deepOrange'
// import lightGreen from '@material-ui/core/colors/lightGreen'
import grey from '@material-ui/core/colors/grey';
import {createMuiTheme} from '@material-ui/core/styles';
import {ThemeOptions} from '@material-ui/core/styles/createMuiTheme';
import spacing from '@material-ui/core/styles/spacing';

const darkBlack = '0x000000';
const fontBody = 'MinionPro, serif';
const fontHeader = 'Cinzel, serif';

export const defaultTheme = {
  spacing,
  typography: {
    fontFamily: fontBody,
  },
  palette: {
    type: 'dark',
    primary: {
      light: grey[100],
      main: grey[900],
      dark: darkBlack,
      contrastText: grey[100],
    },
  },
  overrides: {
    MuiTypography: {
      title: {
        fontFamily: fontHeader,
        fontWeight: 'bold',
        flex: 1, // In appbars
      },
    },
  },

    // secondary: {
    //   light: '#F00',
    //   main: '#0F0',
    //   dark: '#00F',
    //   contrastText: '#ffcc00',
    // },
      // contrastText: getContrastText(palette.primary[500]),
    // primary2Color: grey[800],
    // primary3Color: darkBlack,
    // accent1Color: grey[700],
    // accent2Color: grey[900],
    // accent3Color: grey[100],
    // textColor: grey[100],
    // alternateTextColor: grey[300],
    // secondaryTextColor: grey[700],
    // canvasColor: grey[900],
    // borderColor: grey[800],
    // // disabledColor: fade(grey100, 0.4),
    // pickerHeaderColor: deepOrange[700],
    // // clockCircleColor: fade(darkBlack, 0.07),
    // shadowColor: darkBlack,
  // toggle: {
  //   thumbOnColor: lightGreen700,
  //   trackOnColor: lightGreen900,
  //   thumbOffColor: grey300,
  //   trackOffColor: grey800,
  // },
  // radioButton: {
  //   checkedColor: lightGreen700,
  //   borderColor: grey800,
  // }
  // Not sure why these got added (from app), but they're unused
  // vw: {
  //   huge: '12vw',
  //   large: '6vw',
  //   base: '2vw',
  //   small: '1vw',
  //   tiny: '0.5vw',
  // },
  // vh: {
  //   huge: '12vh',
  //   large: '6vh',
  //   base: '2vh',
  //   small: '1vh',
  //   tiny: '0.5vh',
  // },
  // icon: {
  //   width: '0.15in',
  //   size: '7vw',
  //   arrowSize: '8vw',
  // },
  // fontSize: {
  //   interactive: '5.5vw',
  //   flavortext: '4.7vw',
  //   title: '6.2vw',
  // },
  // card: {
  //   width: '3in',
  //   height: '5in',
  //   contentHeight: '3in',
  //   footerHeight: '0.4in',
  //   headerFont: 'CinzelBold, serif',
  //   fontBoldWeight: 700,
  // },
  // border: {
  //   primary: '0.03in solid #000000',
  //   accent: '0.03in solid #CCCCCC',
  //   faded: '0.03in solid #777777',
  // },
  // inlineIcon: {
  //   width: '5vw',
  //   marginBottom: '-0.5vw',
  // },
  // colors: {
  //   // TODO: Consolidate this with the palette
  //   fontColorPrimary: '#000000',
  //   fontColorFaded: '#666666',
  //   fontColorDarkPrimary: '#FFFFFF',

  //   backgroundColorPrimary: '#FFFFFF',
  //   backgroundColorAccent: 'rgb(220, 220, 220)',
  //   backgroundColorInteractive: 'rgba(255, 255, 255, 0.7)', /* Clickable */
  //   backgroundColorActive: 'rgba(255, 255, 255, 0.9)', /* Clicked */
  //   backgroundColorDarkPrimary: 'rgb(20, 20, 20)',
  //   backgroundColorDarkAccent: 'rgb(60, 60, 60)',
  //   backgroundColorDarkInteractive: 'rgba(0, 0, 0, 0.7)',
  //   backgroundColorDarkActive: 'rgba(30, 30, 30, 1.0)',
  //   backgroundColorSurgePrimary: '#CC0000',
  // }
} as ThemeOptions;

export default createMuiTheme(defaultTheme);
