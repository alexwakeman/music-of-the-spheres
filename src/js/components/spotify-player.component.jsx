import * as React from 'react';

export function SpotifyPlayerComponent({artist}) {
	const embedUrl = 'https://open.spotify.com/embed/artist/';
	const artistEmbedUrl = `${embedUrl}${artist.id}`;
	let iFrameMarkup = '';
	if (artist.id) {
		iFrameMarkup = (
			<div id="spotify-player">
				<iframe src={artistEmbedUrl} width="300" height="80" />
				<div className="album-nav">
					<a href="#">Prev</a>
					<a href="#">Next</a>
				</div>
			</div>
		)
	}
	return (
		<div className="spotify-player-container">
			{iFrameMarkup}
		</div>
	)
}