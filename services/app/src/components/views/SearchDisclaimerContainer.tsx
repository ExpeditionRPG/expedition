import {connect} from 'react-redux';
import Redux from 'redux';
import {toCard} from '../../actions/Card';
import {sendAuthTokenToAPIServer} from '../../actions/User';
import {fetchUserQuests, subscribe} from '../../actions/Web';
import {UserState} from '../../reducers/StateTypes';
import SearchDisclaimer, {Props} from './SearchDisclaimer';

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): Props => {
  return {
    onLogin: (jwt: string, sub: boolean) => {
      sendAuthTokenToAPIServer(jwt)
        .then((user: UserState) => {
          console.log('Now have user state', user);
          dispatch({type: 'USER_LOGIN', user});
          if (user) {
            dispatch(fetchUserQuests());
          }
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
