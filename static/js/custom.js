// A $( document ).ready() block.
$( document ).ready(function() {
    console.log( "ready!" );
    $('#div-search-results').hide();
    $('#btn-search').click(function(args) {
      var query = $('#input-query').val();
      searchJob(query);
    });
});

function searchJob(query) {
  console.log('Searching job for ' + query);
  $('#div-search-results').show();
}
