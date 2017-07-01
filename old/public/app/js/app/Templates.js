var PES = PES || {};

PES.Templates = {
	
	ArtistNavTemplate: 
		'<div class="artist">'
			+ '<a href="/?artist={{name}}" id="{{id}}" data-nav-index="{{navIndex}}" class="nav-artist-link">'
			+ '<img class="picture" src="{{imgUrl}}">'
			+ '<span class="name">{{name}}</span></a>'
		+ '</div>',
	
	
	
	MainArtistInfoTemplate:
		'<div class="main-artist artist-info">'
			+ '<ul>'
				+ '<li>Familiarity: {{familiarity}}</li>'
				+ '<li>Years active: {{yearsActive}}</li>'
				+ '<li>Location: {{location}}</li>'
			+ '</ul>'
		+ '</div>',
	
	
	RelatedArtistInfoTemplate:
		'<div class="related-artist artist-info">'
			+ '<span class="name">{{name}}</span>'
			+ '<ul>'
				+ '<li>Familiarity: {{familiarity}}</li>'
				+ '<li>Chronological similarity to {{mainArtistName}} : {{similarity}}</li>'
				+ '<li>Years active: {{yearsActive}}</li>'
				+ '<li>Location: {{location}}</li>'
			+ '</ul>'
		+ '</div>'
}