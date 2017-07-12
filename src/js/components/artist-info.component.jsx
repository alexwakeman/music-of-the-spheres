import * as React from 'react';
import {store} from '../state/store';

export function ArtistInfoComponent({artist, isHidden}) {
	const genres = artist.genres.map((genre) => {
		return <span className="pill" key={genre}>{genre}</span>
	});
	const classes = isHidden ? 'hidden info-container' : 'info-container';
	return (
		<div className={classes}>
			<div className="popularity"><span className="title">Popularity:</span> <span className="pill">{artist.popularity}</span></div>
			<div className="genres"><span className="title">Genres:</span> {genres}</div>
		</div>
	)
}
