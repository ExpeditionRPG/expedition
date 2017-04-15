import {
  amber100, amber300, amber500, amber600, amber700, amber900,
  deepOrange100, deepOrange700,
  lightGreen300, lightGreen700, lightGreen900,
  grey100, grey300, grey700, grey800, grey900,
  darkBlack, fullBlack
} from 'material-ui/styles/colors';
import {fade} from 'material-ui/utils/colorManipulator';
import spacing from 'material-ui/styles/spacing';

let theme: any = {
  spacing: spacing,
  fontFamily: 'MinionPro, serif',
  palette: {
    primary1Color: grey100,
    primary2Color: grey300,
    primary3Color: grey700,
    accent1Color: lightGreen700,
    accent2Color: lightGreen900,
    accent3Color: lightGreen300,
    textColor: darkBlack,
    alternateTextColor: darkBlack,
    secondaryTextColor: darkBlack,
    canvasColor: grey100,
    borderColor: grey300,
    disabledColor: fade(grey100, 0.3),
    pickerHeaderColor: deepOrange700,
    clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: darkBlack,
  },
  checkbox: {
    checkedColor: darkBlack,
  },
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
    fontColorFaded: '#777777',
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
};

export default theme