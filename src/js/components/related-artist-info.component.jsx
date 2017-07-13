import * as React from 'react';

export function RelatedArtistInfoComponent({relatedArtist, showRelated}) {
	const genres = relatedArtist.genres.map((genre) => {
		return <span className="pill" key={genre}>{genre}</span>
	});
	const classes = showRelated ? 'info-container related' : 'hidden info-container related';
	return (
		<div>
			<div className="artist-name-tag related"><span className="title">{relatedArtist.name}</span></div>
			<div className={classes}>
				<div className="popularity"><span className="title">Popularity:</span> <span className="pill">{relatedArtist.popularity}</span></div>
				<div className="genres">{genres}</div>
			</div>
		</div>
	)
}
