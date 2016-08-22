// Using the closure to map jQuery to $.
(function ($) {

// Store our function as a property of Drupal.behaviors.
Drupal.behaviors.citexplore =  function (context, settings) {
 
		$('#search-citexplore').click(function(e) {
			var paper = document.getElementById('edit-publication-paper-id').value;
			var id_type = $('#edit-publication-paper-id-type').val();
			//var published = mktime(0, 0, 0, '1', '1', '1111');

			if(paper) {
		$('#citexplore-throbber').show();
				// For some reason, this encoding does not seem to work for DOIs, needs a string hack instead :(
				// var encoded = encodeURIComponent(paper);
				var encoded = paper.replace(/\//g,'DOISLASH');
				
				$.getJSON('/citexplore/get/paper/'+ id_type + '/' + encoded , publicationDetails);
			} else {
				alert('You must enter a PubMed ID, DOI or ISBN number.');
			}
		});


};


var publicationDetails = function(response) {
	if(!response.data['title']) {
		alert('No entry was found for this paper. Are you sure you set the correct ID type?')
	} else {
    $('#edit-title').val(response.data['title']);
    $('#edit-publication-authors').val(response.data['authors']);
    $('#edit-publication-first-author').val(response.data['first-author']);
    $('#edit-publication-journal').val(response.data['journal']);
    $('#edit-publication-volume').val(response.data['volume']);
    $('#edit-publication-year').val(response.data['year']);
    $('#edit-publication-pages').val(response.data['pages']);
    $('#edit-publication-pmid').val(response.data['pmid']);
    $('#edit-publication-doi').val(response.data['doi']);
    if(response.data['type'] == "ISBN"){
        $('#edit-publication-isbn').val(document.getElementById('edit-publication-paper-id').value);    	
    }
    $('#edit-publication-link').val(response.data['link']);
    $('#edit-publication-dateOfCreation').val(response.data['dateOfCreation']);
	}
	$('#citexplore-throbber').hide();
}

}(jQuery));


