import * as React from 'react';
import {store} from '../state/store';

export function ArtistInfoComponent({artist}) {
	let artistInfoMarkup = '';
	const genres = artist.genres.map((genre) => {
		return <span className="pill" key={genre}>{genre}</span>
	});
	if (artist.id) {
		artistInfoMarkup = (
			<div className="info-container">
				<div className="popularity"><span className="title">Popularity:</span> <span className="pill">{artist.popularity}</span></div>
				<div className="genres"><span className="title">Genres:</span> {genres}</div>
			</div>
		)
	}
	return (
		<div>{artistInfoMarkup}</div>
	)
}
