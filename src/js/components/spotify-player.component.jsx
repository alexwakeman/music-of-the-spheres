import * as React from 'react';

export function SpotifyPlayerComponent({artist}) {
	const embedUrl = 'https://open.spotify.com/embed/artist/';
	const artistEmbedUrl = `${embedUrl}${artist.id}`;
	let iFrameMarkup = '';
	if (artist.id) {
		iFrameMarkup = <iframe src={artistEmbedUrl} width="300" height="80" />
	}
	return (
		<div className="spotify-player-container">
			<div id="spotify-player">
				{iFrameMarkup}
			</div>
			<div className="album-nav">
				<a href="#">Prev</a>
				<a href="#">Next</a>
			</div>
		</div>
	)
}