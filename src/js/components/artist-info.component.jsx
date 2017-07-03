import * as React from 'react';
import {store} from '../state/store';

export function ArtistInfoComponent({artist}) {
	const genres = artist.genres.map((genre) => {
		return <span className="artist-genre" key={genre}>{genre}</span>
	});
	return (
        <div className="info-container">
            <ul>
                <li>Popularity: {artist.popularity}</li>
                <li>Genres: {genres}</li>
            </ul>
        </div>
	)
}
