import * as React from 'react';
import {store} from '../state/store';

export function ArtistListComponent() {
	let visitedArtists = store.getState().visitedArtists;
	store.subscribe(() => {
		visitedArtists = store.getState().visitedArtists;
	});
	let artists = visitedArtists.map((artist) => {
		return (
			<div className="artist">
				<a href='/?artist='{artist.name} id={artist.id} className="nav-artist-link">
					<img className="picture" src={artist.imgUrl} />
					<span className="name">{artist.name}</span>
				</a>
			</div>
		)
	});
	return (
		<div className="artists-container">
			{artists}
		</div>
	)
}
