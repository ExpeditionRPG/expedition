import {
  deepOrange700,
  lightGreen700, lightGreen900,
  grey100, grey300, grey700, grey800, grey900,
  darkBlack
} from 'material-ui/styles/colors'
import {fade} from 'material-ui/utils/colorManipulator'
import spacing from 'material-ui/styles/spacing'

let theme: any = {
  spacing: spacing,
  palette: {
    primary1Color: grey900,
    primary2Color: grey800,
    primary3Color: darkBlack,
    accent1Color: grey700,
    accent2Color: grey900,
    accent3Color: grey100,
    textColor: grey100,
    alternateTextColor: grey300,
    secondaryTextColor: grey700,
    canvasColor: grey900,
    borderColor: grey800,
    disabledColor: fade(grey100, 0.4),
    pickerHeaderColor: deepOrange700,
    clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: darkBlack,
  },
  toggle: {
    thumbOnColor: lightGreen700,
    trackOnColor: lightGreen900,
    thumbOffColor: grey300,
    trackOffColor: grey800,
  },
  radioButton: {
    checkedColor: lightGreen700,
    borderColor: grey800,
  }
};

export default theme
