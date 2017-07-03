import * as React from 'react';
import {store} from '../state/store';

export function ArtistListComponent({visitedArtists}) {
	let artists = visitedArtists.map((artist) => {
		let href = '/?artist=' + artist.name;
		return (
			<div className="artist" key={artist.id}>
				<a href={href} id={artist.id} className="nav-artist-link">
					<img className="picture" src={artist.imgUrl} />
					<span className="name">{artist.name}</span>
				</a>
			</div>
		)
	});
	return (
		<div className="artist-navigation">
			{artists}
		</div>
	)
}
