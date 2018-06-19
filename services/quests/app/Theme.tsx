import {createMuiTheme} from '@material-ui/core/styles'
import deepOrange from '@material-ui/core/colors/deepOrange'
import lightGreen from '@material-ui/core/colors/lightGreen'
import grey from '@material-ui/core/colors/grey'
import spacing from '@material-ui/core/styles/spacing'

const darkBlack = '0x000000';
// import {
//   deepOrange700,
//   lightGreen700, lightGreen900,
//   grey100, grey300, grey700, grey800, grey900,
//   darkBlack
// } from '@material-ui/core/styles/colors'
// // import {fade} from '@material-ui/core/utils/colorManipulator'
// import spacing from '@material-ui/core/styles/spacing'

export default createMuiTheme({
  spacing: spacing,
  palette: {
    primary1Color: grey[900],
    primary2Color: grey[800],
    primary3Color: darkBlack,
    accent1Color: grey[700],
    accent2Color: grey[900],
    accent3Color: grey[100],
    textColor: grey[100],
    alternateTextColor: grey[300],
    secondaryTextColor: grey[900],
    canvasColor: grey[900],
    borderColor: grey[800],
    // disabledColor: fade(grey100, 0.3),
    pickerHeaderColor: deepOrange[700],
    // clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: darkBlack,
  },
  // toggle: {
  //   thumbOnColor: lightGreen[700],
  //   trackOnColor: lightGreen[900],
  //   thumbOffColor: grey[300],
  //   trackOffColor: grey[800],
  // },
  // radioButton: {
  //   checkedColor: lightGreen[700],
  //   borderColor: grey[800],
  // }
});
