import {createMuiTheme} from '@material-ui/core/styles';
import {defaultTheme} from 'shared/Theme';

export default createMuiTheme({
  ...defaultTheme,
  palette: {
    ...defaultTheme.palette,
    type: 'light',
  },
});
