var _RAW_QUERY = '';

$( document ).ready(function() {
    console.log( "ready!" );

    firebase.auth().signInAnonymously().catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log('Error: ' + errorCode + ' msg: ' + errorMessage);
    });

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        // console.log('signInAnonymously: ' + JSON.stringify(user));
        console.log('signed in');
      } else {
        console.log('signed out');
      }
    });

    $('#span-num-search-results').text('0');

    var currentUrl = window.location.href;
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

    } else if(currentUrl.indexOf('/search?q=') > 0) {
      console.log('SEARCH BY GET');
      var params = getJsonFromUrl(currentUrl);
      var query = params.q.toLowerCase();
      console.log('param: ' + query);
      $('#input-query').val(query);
      DoSearch();
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
    }
});

function DoSearch() {
  console.log('Doing search...');
  console.log('Cleaning up previous search');
  $('#ul-search-results').children().remove();
  _RAW_QUERY = $('#input-query').val().toLowerCase();;
  GetJobKeys(_RAW_QUERY);
  
  // Log the query for analysis.
  if (firebase.auth().currentUser != null) {
    logQuery(firebase.auth().currentUser.uid, _RAW_QUERY);
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

function logQuery(uid, query) {
  var newLogKey = firebase.database().ref().child('logs').push({
      'uid': uid,
      'query': query,
      'date': getTodayDate(),
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

function searchJob(rawQuery) {
  console.log('Searching job for ' + rawQuery);
  var queryWords = rawQuery.split(' ');

  var results = [];
  for (var i = queryWords.length - 1; i >= 0; i--) {
    var query = queryWords[i];
    SearchFb(query);
    break;
  }

  $('#div-search-results').show();
}

function GetJobKeys(query) {
  console.log('GetJobKeys ' + query);
  var jobKeys = [];
  var ref = firebase.database().ref('jobs_index/' + query).orderByValue().limitToFirst(20);
  ref.once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.key;
      var childData = childSnapshot.val();
      // console.log('childKey: ' + JSON.stringify(childKey));
      // console.log('childData: ' + JSON.stringify(childData));
      jobKeys.push(childData);
    });
    GetJobs(jobKeys);
  });
}

function GetJobs(jobKeys) {
  console.log('GetJobs ' + jobKeys.length);
  var jobs = [];
  for (var i = jobKeys.length - 1; i >= 0; i--) {
    var key = jobKeys[i];
    var ref = firebase.database().ref('jobs_hash_keyed/' + key);
    ref.once('value', function(snapshot) {
      // No need to do the foreach because it's already one single object.
      // If you do this for each it iterates over the object keys. Unnecessary
      // looping.
      jobs.push(JSON.parse(JSON.stringify(snapshot)));
      updateUI(jobs);
    });
  }
}

function updateUI(jobs) {
  console.log('updateUI');
  $('#h3-search-query').text(_RAW_QUERY);
  $('#span-num-search-results').text(jobs.length);
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
  $('#div-search-results').show();
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
  $('#div-job-details').append('<p><a href="' + job.link + '" target="_blank">Hemen bu işe başvur</a></h2>');
}