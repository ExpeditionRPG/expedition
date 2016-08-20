import {
  amber100, amber500, amber600, amber700, amber900,
  grey300, grey800, grey900,
  darkBlack, fullBlack,
} from 'material-ui/styles/colors';
import {fade} from 'material-ui/utils/colorManipulator';
import spacing from 'material-ui/styles/spacing';

export default {
  spacing: spacing,
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: darkBlack,
    primary2Color: grey900,
    primary3Color: grey800,
    accent1Color: amber500,
    accent2Color: amber600,
    accent3Color: amber700,
    textColor: amber900,
    alternateTextColor: amber100,
    canvasColor: fullBlack,
    borderColor: grey300,
    disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: amber500,
    clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: fullBlack,
  },
};