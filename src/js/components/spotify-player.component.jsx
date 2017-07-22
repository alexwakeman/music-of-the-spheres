import * as React from 'react';

export function SpotifyPlayerComponent({artist, isHidden}) {
	const embedUrl = 'https://open.spotify.com/embed/artist/';
	const artistEmbedUrl = `${embedUrl}${artist.id}`;
	let iFrameMarkup = '',
		albumsListMarkup;
	if (artist.id) {
		iFrameMarkup = (
			<div className="spotify-player">
				<iframe src={artistEmbedUrl} width="300" height="80" />
			</div>
		)

	}
	const classes = isHidden ? 'hidden spotify-player-container' : 'spotify-player-container';
	return (
		<div className={classes}>
			{iFrameMarkup}
		</div>
	)
}