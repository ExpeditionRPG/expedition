import {
  amber100, amber300, amber500, amber600, amber700, amber900,
  deepOrange100, deepOrange700,
  lightGreen300, lightGreen700,
  grey100, grey300, grey800, grey900,
  darkBlack, fullBlack
} from 'material-ui/styles/colors';
import {fade} from 'material-ui/utils/colorManipulator';
import spacing from 'material-ui/styles/spacing';

let theme: any = {
  spacing: spacing,
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: darkBlack,
    primary2Color: grey900,
    primary3Color: grey800,
    accent1Color: lightGreen700,
    accent2Color: grey900,
    accent3Color: grey800,
    textColor: grey100,
    alternateTextColor: lightGreen300,
    secondaryTextColor: lightGreen700,
    canvasColor: darkBlack,
    borderColor: grey800,
    disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: lightGreen700,
    clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: darkBlack,
  },
};

export default theme