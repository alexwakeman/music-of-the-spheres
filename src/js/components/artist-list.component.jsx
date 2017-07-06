import * as React from 'react';
import {store} from '../state/store';

export function ArtistListComponent({visitedArtists, handleGetArtist}) {
	let artists = visitedArtists.map((artist) => {
		let href = '/app/#' + encodeURIComponent(artist.id);
		let imgUrl = artist.images && artist.images.length ? artist.images[artist.images.length - 1].url : '';
		return (
			<div className="artist" key={artist.id}>
				<a href={href} id={artist.id} className="nav-artist-link"
				   onClick={(event) => { handleGetArtist(event, artist.id) }}>
					<img className="picture" src={imgUrl} />
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
