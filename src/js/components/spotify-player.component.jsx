import * as React from 'react';

export class SpotifyPlayerComponent extends React.Component {
	constructor({displayAlbums, displayAlbumIndex, isHidden }) {
		super();
		this.displayAlbums = displayAlbums;
		this.displayAlbumIndex = displayAlbumIndex;
		this.isHidden = isHidden;
	}

	render() {
		const embedUrl = 'https://open.spotify.com/embed?uri=spotify:album:';
		const classes = this.isHidden ? 'hidden spotify-player-container' : 'spotify-player-container';
		let artistEmbedUrl;
		let iFrameMarkup = '',
			albumsListMarkup = '',
			albumId;
		if (this.displayAlbums.length) {
			albumId = this.displayAlbums[this.displayAlbumIndex].id;
			artistEmbedUrl = `${embedUrl}${albumId}`;
			iFrameMarkup = (
				<div className="spotify-player">
					<iframe src={artistEmbedUrl} width="300" height="380" frameBorder="0" allowTransparency="true"/>
				</div>
			);
			albumsListMarkup = this.displayAlbums.map((album) => {
				return (
					<div className="album">
						{album.name}
					</div>
				)
			});
		}
		return (
			<div className={classes}>
				{iFrameMarkup}
				<div className="albums-list">
					{albumsListMarkup}
				</div>
			</div>
		)
	}
}
