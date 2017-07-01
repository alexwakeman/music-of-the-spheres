import * as React from 'react';

export function ArtistInfoComponent({artist}) {
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
