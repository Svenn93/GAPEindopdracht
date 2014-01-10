(function(){
    // init the FB JS SDK
  $.ajaxSetup({ cache: true });
  $.getScript('//connect.facebook.net/en_UK/all.js', function(){
    FB.init({
      appId: '183745065168258',
    });     
    FB.getLoginStatus(checkFBStatus);

    function checkFBStatus(){
    FB.getLoginStatus(function(response) {
      if (response.status === 'connected') {
      var uid = response.authResponse.userID;
      var accessToken = response.authResponse.accessToken;
      $('#menu').append("<img src ='http://graph.facebook.com/" + uid + "/picture' />");
      } else if (response.status === 'not_authorized') {
      $('#menu').append("<p>ingelogd, zonder permisse</p>");
      } else {
      $('#menu').append("<p>niet ingelogd, zonder permisse</p>");
      }
    });
  }

  });

})();