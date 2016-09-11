import {SET_PROFILE_META, SetProfileMetaAction} from './ActionTypes'
import {UserType} from '../reducers/StateTypes'

function setProfileMeta(user: UserType): SetProfileMetaAction {
  return {type: 'SET_PROFILE_META', user};
}

export function followUserAuthLink(link: string): ((dispatch: Redux.Dispatch<any>)=>void) {
  return (dispatch: Redux.Dispatch<any>) => {
    var win = window.open(link, 'Auth', 'width=972,height=660,modal=yes,alwaysRaised=yes');

    var checkConnect = setInterval(function() {
        if (!win || !win.closed) return;
        clearInterval(checkConnect);
        $.get('/locals').done(data => {
          var locals = JSON.parse(data);
          dispatch(setProfileMeta({profile: locals.profile, login: locals.login, logout: locals.logout}));
        });
    }, 100);
  }
}