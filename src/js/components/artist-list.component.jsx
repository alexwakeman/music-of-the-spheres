import * as React from 'react';

export function ArtistListComponent({artistList}) {

	let artists = artistList.map((artist) => {
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
