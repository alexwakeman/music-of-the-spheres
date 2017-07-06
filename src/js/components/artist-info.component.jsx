import * as React from 'react';
import {store} from '../state/store';

export function ArtistInfoComponent({artist}) {
	let artistInfoMarkup = '';
	const genres = artist.genres.map((genre) => {
		return <span className="artist-genre" key={genre}>{genre}</span>
	});
	if (artist.id) {
		artistInfoMarkup = (
			<div className="info-container">
				<div>Popularity: {artist.popularity}</div>
				<div className="genres">Genres: {genres}</div>
			</div>
		)
	}
	return (
		<div>{artistInfoMarkup}</div>
	)
}
