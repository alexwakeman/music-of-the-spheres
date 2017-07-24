import * as React from 'react';

export class SpotifyPlayerComponent extends React.Component {
	constructor({displayAlbums, displayAlbumIndex, isHidden, albumClickHandler}) {
		super();
		this.displayAlbums = displayAlbums;
		this.displayAlbumIndex = displayAlbumIndex;
		this.isHidden = isHidden;
		this.albumClickHandler = albumClickHandler;
	}

	render() {
		const embedUrl = 'https://open.spotify.com/embed?uri=spotify:album:';
		const classes = this.isHidden ? 'hidden spotify-player-container' : 'spotify-player-container';
		let artistEmbedUrl,
			iFrameMarkup = '',
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
						<a onClick={(evt) => this.albumClickHandler(evt, album)}>{album.name}</a>
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
