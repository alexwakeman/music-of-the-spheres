import * as React from 'react';
import {store} from '../state/store';

export function ArtistInfoComponent() {
	let artist = store.getState().artist;
	store.subscribe(() => {
		artist = store.getState().artist;
	});
	const genres = artist.genres.map((genre) => {
		return <span className="artist-genre">{genre}</span>
	});
	return (
        <div className="artist-info">
            <ul>
                <li>Popularity: {artist.popularity}</li>
                <li>Genres: {genres}</li>
            </ul>
        </div>
	)
}
