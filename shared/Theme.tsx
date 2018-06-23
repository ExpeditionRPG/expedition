// Shared Material-UI theming
// https://material-ui.com/customization/themes

import {createMuiTheme} from '@material-ui/core/styles'
// import deepOrange from '@material-ui/core/colors/deepOrange'
// import lightGreen from '@material-ui/core/colors/lightGreen'
import grey from '@material-ui/core/colors/grey'
import spacing from '@material-ui/core/styles/spacing'

const darkBlack = '0x000000';
const fontBody = 'MinionPro, serif';
const fontHeader = 'Cinzel, serif';

// TODO FIXME

export default createMuiTheme({
  spacing: spacing,
  typography: {
    fontFamily: fontBody,
  },
  palette: {
    type: 'dark',
    primary: {
      light: grey[100],
      main: grey[900],
      dark: darkBlack,
      contrastText: '#ffcc00',
    },
  },
  overrides: {
    MuiTypography: {
      title: {
        fontFamily: fontHeader,
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
});
