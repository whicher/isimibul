// A $( document ).ready() block.
$( document ).ready(function() {
    console.log( "ready!" );
    $('#div-search-results').hide();
    $('#btn-search').click(function(args) {
      var query = $('#input-query').val();
      searchJob(query);
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

    FBTrials('eleman');
});

function searchJob(query) {
  console.log('Searching job for ' + query);
  $('#div-search-results').show();
}

function FBTrials(query) {
  console.log('FBTrials');
  var ref = firebase.database().ref('jobs_index/' + query).orderByValue().limitToFirst(20);
  ref.once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.key;
      var childData = childSnapshot.val();
      console.log('childKey: ' + JSON.stringify(childKey));
      console.log('childData: ' + JSON.stringify(childData));
    });
  });
}