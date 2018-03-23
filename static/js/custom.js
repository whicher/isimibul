var _RAW_QUERY = '';
var _RESULTS_PER_PAGE = 10;

$( document ).ready(function() {
    console.log( "ready!" );
    var currentUrl = window.location.href;

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        // console.log('signInAnonymously: ' + JSON.stringify(user));
        console.log('signed in as ' + user.displayName);
        updateUiWithLogin();
        if (!isAnonymous) {
          createProfileInfo();
          // If not anonim and trying to go to login page, redirect to profile.
          if(currentUrl.indexOf('/login') > 0) {
            console.log('Already logged in, no need to go to login page');
            window.location = '/profile';
          }
        }
      } else {
        console.log('signed out');
        updateUiWithLogin();
        if(currentUrl.indexOf('/profile') > 0) {
          console.log('Logged out, cant go to profile page, redirect to login');
          window.location = '/login';
        }
      }
    });

    $('#span-num-search-results').text('0');

    $('#btn-logout').click(function(args){
      console.log('Logging out');
      firebase.auth().signOut();
      updateUiWithLogin();
    });

    // URL handling.
    if(currentUrl.indexOf('/details?job=') > 0) {
      console.log('DETAILS PAGE');
      $('#div-job-details').append('<h1>İş Detayları</h1>');
      var params = getJsonFromUrl(currentUrl);
      var jobKey = params.job.substr(params.job.lastIndexOf('_') + 1);
      console.log('param: ' + jobKey);

      var ref = firebase.database().ref('jobs_hash_keyed/' + jobKey);
      var job = {};
      ref.once('value', function(snapshot) {
        // snapshot.forEach(function(childSnapshot) {
        //   var childKey = childSnapshot.key;
        //   var childData = childSnapshot.val();
        //   // console.log('childKey: ' + JSON.stringify(childKey));
        //   // console.log('childData: ' + JSON.stringify(childData));
        //   job = childData;
        // });
        updateUIDetails(JSON.parse(JSON.stringify(snapshot)));
      });

    } else if(
        currentUrl.indexOf('/search?q=') > 0 ||
        currentUrl.indexOf('/search?search_query=') > 0) {
      console.log('SEARCH BY GET');
      var params = getJsonFromUrl(currentUrl);
      var query = '';
      if (params.hasOwnProperty('q')) {
        query = params.q;
      } else {
        query = params.search_query;
      }
      query = query.replace(/\+/g, ' ');

      console.log('param: ' + query);
      $('#input-query').val(query);
      DoSearch();
    } else if(currentUrl.indexOf('/profile') > 0) {
      console.log('PROFILE PAGE');
      var user = firebase.auth().currentUser;
      console.log('current user: ' + JSON.stringify(user));
      if (user == null) {
        //window.location = '/login';
      } else {
        // updateUiWithLogin();
        // createProfileInfo();
      }
    } else {
      console.log('HOMEPAGE');
      $('#div-search-results').hide();

      $('#form-search').submit(function(e) {
        e.preventDefault();
        DoSearch();
      });

      $('#btn-login').click(function(args){
        console.log('Logging in');
        var email = $('#input-email').val();
        var password = $('#input-password').val();
        console.log('Creds: ' + email + ' ' + password);
        // TODO(hakanu): Firebase login here.
      });

      $('#btn-signup').click(function(args){
        console.log('Signing up');
        var email = $('#input-signup-email').val();
        var password = $('#input-signup-password').val();
        var name = $('#input-signup-name').val();
        var background = $('#input-signup-background').val();
        var uni = $('#input-signup-uni').val();
        var uniDept = $('#input-signup-uni-dept').val();
        console.log('Creds: ' + email + ' ' + password + ' ' + background + '' +
                    name + ' ' + uni + ' ' + uniDept);
        // TODO(hakanu): Firebase sign up here.
      });

      $('#btn-google-signin').click(function(args){
        console.log('Signing in with Google');
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/plus.login');
        firebase.auth().signInWithPopup(provider).then(function(result) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;
          console.log('user: ' + JSON.stringify(user));
          updateUiWithLogin();
          //window.location = '/';
          navigateToProfileIfLoggedIn();
        }).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          console.log('Error: ' + JSON.stringify(error));
        });
      });

      $('#btn-facebook-signin').click(function(args){
        console.log('Signing in with facebook');
        var provider = new firebase.auth.FacebookAuthProvider();
        provider.setCustomParameters({
          'display': 'popup'
        });
        firebase.auth().signInWithPopup(provider).then(function(result) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;
          console.log('user: ' + JSON.stringify(user));
          updateUiWithLogin();
          //window.location = '/';
          navigateToProfileIfLoggedIn();
        }).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          console.log('Error: ' + JSON.stringify(error));
        });
      });
    }
});

// function GetParams() {
//   var queryDict = {};
//   location.search.substr(1).split("&").forEach(function(item) {queryDict[item.split("=")[0]] = item.split("=")[1]});
//   return queryDict;
// }

function DoCSESearch(q, page) {
  var url = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyAgqt4NU_7WjZvjKrD4uQZy8M2-8pW5fTc&cx=015837852584757943655:7tzh1bko-w4&num=' + _RESULTS_PER_PAGE + '&q=' + q;
  if (page > 0) {
    url += '&start=' + _RESULTS_PER_PAGE * page
  }
  console.log('url: ' + url);
  $.get(url, function(data) {
    console.log(data);
    $('#span-num-search-results').text(data.searchInformation.totalResults);
    $('#span-search-time').text(data.searchInformation.searchTime);
    document.getElementById("content").innerHTML = '';
    for (var i = 0; i < data.items.length; i++) {
      var item = data.items[i];
      // in production code, item.htmlTitle should have the HTML entities escaped.
      var thumbnail = '';
      if (item.pagemap.cse_thumbnail) {
          thumbnail = item.pagemap.cse_thumbnail[0].src;
      }
      document.getElementById("content").innerHTML += (
          "<div>" +
            "<p><img src=\"" + thumbnail + "\"></p>" +
            "<p><b>" +
              "<a href=" + item.link + " target=\"_blank\">" + item.htmlTitle + "</a>" +
            "</b></p>" +
            "<p>" + item.snippet + "</p>" +
          "</div>"
      );
    }
  });
}

function DoSearch() {
  console.log('Doing search...');
  console.log('Cleaning up previous search');
  console.log(getJsonFromUrl());
  var params = getJsonFromUrl();

  $('#ul-search-results').children().remove();
  var originalQuery = $('#input-query').val();
  $('#current-page').innerHTML = '0';
  
  var currentPage = 0;
  if ('p' in params) {
    currentPage = parseInt(params.p);
    $('#current-page').text(currentPage);
    ;
  }
  console.log('Current page: ' + currentPage);
  if (currentPage > 1) {
    $('#btn-prev').attr('href', (
        '/search?q=' + originalQuery + '&p=' + (currentPage - 1)));
  }
  $('#btn-next').attr('href', (
      '/search?q=' + originalQuery + '&p=' + (currentPage + 1)));

  if ('q' in params) {
    originalQuery = params.q;
    $('#input-query').innerHTML = originalQuery;
  }

  DoCSESearch(originalQuery, currentPage);
  $('#h3-search-query').innerHTML = originalQuery;

  // _RAW_QUERY = originalQuery.toLowerCase();
  // Check if user is logged in.
  // If not, do an anonymous login otherwise no permission.
  // var user = firebase.auth().currentUser;
  // console.log('Querying as user: ' + user);
  // if (user == null) {
  //   console.log('user is null so signing in anonymously');
  //   firebase.auth().signInAnonymously().catch(function(error) {
  //     // Handle Errors here.
  //     var errorCode = error.code;
  //     var errorMessage = error.message;
  //     console.log('Error: ' + errorCode + ' msg: ' + errorMessage);
  //   });
  // }

  // GetJobKeys(_RAW_QUERY);

  // Log the query for analysis.
  if (firebase.auth().currentUser != null) {
    logQuery(firebase.auth().currentUser.uid, _RAW_QUERY, originalQuery);
  } else {
    console.log('Can not log bc not logged in');
  }
}

function getTodayDate() {
    var d = new Date();
    var currentYear = d.getFullYear().toString();
    var currentMonth = (
        d.getMonth() + 1 >= 10 ? d.getMonth() + 1 : '0' + (d.getMonth() + 1));
    var currentDay = d.getDate() >= 10 ? d.getDate() : '0' + (d.getDate());
    console.log(currentYear + '-' + currentMonth + '-' + currentDay);
    return currentYear + '-' + currentMonth + '-' + currentDay;
}

function logQuery(uid, query, originalQuery) {
  var d = getTodayDate();
  var newLogKey = firebase.database().ref().child('logs/' + d).push({
      'uid': uid,
      'query': query,
      'rawQuery': originalQuery,
      'date': getTodayDate(),
      'medium': 'web',
  }).key;
  console.log('Pushed log key: ' + newLogKey);
  //return firebase.database().ref().update(updates);
}

function getJsonFromUrl() {
  var query = location.search.substr(1);
  var result = {};
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}

function GetJobKeys(query) {
  console.log('GetJobKeys ' + query);
  var queryParts = query.trim().split(' ');
  var numFetchingDone = 0;
  // Get the initial results and then seek for other terms if they exist.
  var queryPart = queryParts[0];
  var jobKeys = [];
  var jobKeysStats = {};
  //console.log('searching for ' + queryPart);
  var ref = firebase.database().ref('jobs_index/' + queryPart).orderByValue().limitToFirst(50);
  ref.once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.key;
      var childData = childSnapshot.val();
      //console.log('Getting job details for ' + childData);
      var refInner = firebase.database().ref('jobs_hash_keyed/' + childData);
      refInner.once('value', function(snapshotInner) {
        //console.log('fetched the job details: ' + JSON.stringify(snapshotInner));
        var job = JSON.parse(JSON.stringify(snapshotInner));
        var allTermsExist = true;
        for (var i = 1; i < queryParts.length; i++) {
          if (!checkIfTermExistsInJob(job, queryParts[i])) {
            allTermsExist = false;
          }
        }
        if (allTermsExist) {
          appendJobsToUI([job]);
          numFetchingDone++;
          $('#span-num-search-results').text(numFetchingDone);

        }
      });

    });
    //console.log("jobKeysStats: " + JSON.stringify(jobKeysStats));
  });
  $('#h3-search-query').text(_RAW_QUERY);
  $('#div-search-results').show();
}

function checkIfTermExistsInJob(job, term) {
  //console.log('Checking if term exists in job ' + term);
  var text = (
      job.description + ' ' + job.title + ' ' +
      job.category + ' ' + job.company + ' ' + job.city).toLowerCase();
  //console.log('text: ' + text + ' term: ' + term);
  if (text.indexOf(term) > 0) {
    //console.log('exists...');
    return true;
  }
  return false;
}

function appendJobsToUI(jobs) {
  console.log('updateUI');
   for (var i = jobs.length - 1; i >= 0; i--) {
    if ($('#li-job-' + jobs[i].hash).length < 1) {
      $('#ul-search-results').append(
          '<li id="li-job-' + jobs[i].hash +'">' +
          '<h4><a href="/details?job=' + jobs[i].slug + '_' + jobs[i].hash + '" target="_blank">' + jobs[i].title + '</a></h4>' +
          '<sub>' + jobs[i].city + ' | ' + jobs[i].company + ' | ' + jobs[i].category +
          ' | ' + jobs[i].date + '</sub>' +
          '</li>');
    }
  }
}

function navigateToProfileIfLoggedIn() {
  console.log('navigateToProfileIfLoggedIn');
  var user = firebase.auth().currentUser;
  if (user) {
    console.log('Logged in so going to profile');
    // window.location = '/profile';
  } else {
    console.log('Not logged in');
  }
}

function updateUiWithLogin() {
  console.log('updating UI');
  var user = firebase.auth().currentUser;
  if (user && !user.isAnonymous) {
    console.log('Logged in');
    $('#a-signin').text(user.displayName);
    $('#a-signin').attr('href', '/profile');
    $('#btn-logout').text('Oturumu kapat');
  } else {
    console.log('Not logged in');
    $('#a-signin').text('Kaydol/Oturum Aç');
    $('#a-signin').attr('href', '/login');
    $('#btn-logout').text('');
  }
}


// function updateUiAfterLogout() {
//   $('#btn-logout').addClass('hidden');
//   $('#btn-login').removeClass('hidden');
//   $('#p-login-username').html('Not logged in');
//   $('#ul-urls').html('');
//   $('#p-message').text('Log in first');
// }

// /profile page.
function createProfileInfo() {
  console.log('createProfileInfo');
  var user = firebase.auth().currentUser;
  if (user) {
    console.log('Logged in');
    $('#div-profile').append(
        '<h2>' + user.displayName + '</h2>' +
        '<p><img src="' + user.photoURL + '"></p>' +
        '<p>-</p>' +
        '<br>'
    );
  } else {
    console.log('Not logged in');
    $('#a-signin').text('Kaydol/Oturum Aç');
  }
}

function updateUIDetails(job) {
  console.log('updateUIDetails');
  $('#div-job-details').append('<h2>' + job.title + '</h2>');
  $('#div-job-details').append('<ul>');
  $('#div-job-details').append('<li>Şehir: <b>' + job.city + '</b></li>');
  $('#div-job-details').append('<li>Kategori: <b>' + job.category + '</b></li>');
  $('#div-job-details').append('<li>Gereksinimler & aranan özellikler:<br><b>' + job.description + '</b></li>');
  $('#div-job-details').append('<li>Şirket: <a href="' + job.company_link + '" target="_blank">' + job.company + '</a></li>');
  $('#div-job-details').append('<li><img src="' + job.company_img +'"></li>');
  $('#div-job-details').append('</ul>');
  $('#div-job-details').append('<p><a class="btn btn-lg btn-primary btn-block" href="' + job.link + '" target="_blank">Hemen bu işe başvur</a></h2>');
}
