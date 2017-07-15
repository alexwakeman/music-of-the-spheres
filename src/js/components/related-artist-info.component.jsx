import * as React from 'react';

export function RelatedArtistInfoComponent({relatedArtist, hideRelated, hideInfo}) {
	const hiddenClass = hideRelated || hideInfo ? 'hidden info-container related' : 'info-container related';
	return (
		<div className={hiddenClass}>
			<div className="artist-name-tag related">{relatedArtist.name}</div>
			<div className="popularity"><span className="title">Popularity:</span> <span className="pill">{relatedArtist.popularity}</span></div>
			<div className="genres"><span className="title">Genre similarity:</span> <span className="pill">50%</span></div>
		</div>
	)
}
