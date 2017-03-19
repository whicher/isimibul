// A $( document ).ready() block.
$( document ).ready(function() {
    console.log( "ready!" );
    $('#div-search-results').hide();
    $('#btn-search').click(function(args) {
      var query = $('#input-query').val();
      searchJob(query);
    });
    FBTrials();
});

function searchJob(query) {
  console.log('Searching job for ' + query);
  $('#div-search-results').show();
}

function FBTrials() {
  console.log('FBTrials');
  var ref = firebase.database().ref('jobs_test/');
  ref.once('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.key;
      var childData = childSnapshot.val();
      console.log('childKey: ' + JSON.stringify(childKey));
      console.log('childData: ' + JSON.stringify(childData));
    });
  });

  // ref.orderByChild("height").equalTo(25).on("child_added", function(snapshot) {
  //   console.log(snapshot.key());
  // });
}