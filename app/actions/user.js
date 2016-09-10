import {SET_PROFILE_META} from '../ActionTypes'

export function setProfileMeta(profile, login, logout) {
  return {type: SET_PROFILE_META, profile, login, logout};
}

export function followUserAuthLink(link) {
  return dispatch => {
    console.log("Opening " + link);
    var win = window.open(link, 'Auth', 'width=972,height=660,modal=yes,alwaysRaised=yes');

    var checkConnect = setInterval(function() {
        if (!win || !win.closed) return;
        clearInterval(checkConnect);
        console.log("Got closure!");
        $.get('/locals').done(data => {
          var locals = JSON.parse(data);
          dispatch(setProfileMeta(locals.profile, locals.login, locals.logout));
        });
    }, 100);
  }
}