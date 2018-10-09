import {connect} from 'react-redux';
import Redux from 'redux';
import {toCard} from '../../actions/Card';
import {ensureLogin} from '../../actions/User';
import {subscribe} from '../../actions/Web';
import {UserState} from '../../reducers/StateTypes';
import SearchDisclaimer, {Props} from './SearchDisclaimer';

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): Props => {
  return {
    onLoginRequest: (sub: boolean) => {
      dispatch(ensureLogin())
        .then((user: UserState) => {
          if (sub && user.email && user.email !== '') {
            dispatch(subscribe({email: user.email}));
          }
          return dispatch(toCard({name: 'SEARCH_SETTINGS'}));
        });
    },
  };
};

const SearchDisclaimerContainer = connect(
  null,
  mapDispatchToProps
)(SearchDisclaimer);

export default SearchDisclaimerContainer;
