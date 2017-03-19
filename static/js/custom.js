var _RAW_QUERY = '';

$( document ).ready(function() {
    console.log( "ready!" );
    $('#div-search-results').hide();
    $('#btn-search').click(function(args) {
      _RAW_QUERY = $('#input-query').val();
      GetJobKeys(_RAW_QUERY);
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
});

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
      console.log('childKey: ' + JSON.stringify(childKey));
      console.log('childData: ' + JSON.stringify(childData));
      jobKeys.push(childData);
    });
    GetJobs(jobKeys);
  });
}

function GetJobs(jobKeys) {
  console.log('GetJobs ' + jobKeys);
  var jobs = [];
  for (var i = jobKeys.length - 1; i >= 0; i--) {
    var key = jobKeys[i];
    var ref = firebase.database().ref('jobs').orderByChild('link').equalTo(key).limitToFirst(20);
    ref.once('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var childKey = childSnapshot.key;
        var childData = childSnapshot.val();
        console.log('childKey: ' + JSON.stringify(childKey));
        console.log('childData: ' + JSON.stringify(childData));
        jobs.push(childData);
      });
      updateUI(jobs);
    });
  }
}

function updateUI(jobs) {
  console.log('updateUI');
  $('#h3-search-query').text(_RAW_QUERY);
  for (var i = jobs.length - 1; i >= 0; i--) {
    $('#ul-search-results').append(
        '<li>' +
        '<h4><a href="' + jobs[i].link + '" target="_blank">' + jobs[i].title + '</a></h4>' + 
        '<sub>' + jobs[i].city + ' | ' + jobs[i].company + ' | ' + jobs[i].category +
        ' | ' + jobs[i].date + '</sub>' + 
        '</li>');
  }
  $('#div-search-results').show();
}