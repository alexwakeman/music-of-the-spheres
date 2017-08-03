import * as React from 'react';

export class SpotifyPlayerComponent extends React.Component {
	constructor({albumClickHandler}) {
		super();
		this.albumClickHandler = albumClickHandler;
	}

	render() {
		const { displayAlbumIndex, displayArtist, showUI } = this.props;
		const embedUrl = 'https://open.spotify.com/embed?uri=spotify:album:';
		const classes = showUI ? 'spotify-player-container' : 'hidden spotify-player-container';
		const albums = displayArtist.albums;
		let artistEmbedUrl,
			iFrameMarkup = '',
			albumsListMarkup = '',
			albumId;
		
		if (albums && albums.length) {
			albumId = albums[displayAlbumIndex].id;
			artistEmbedUrl = `${embedUrl}${albumId}`;
			iFrameMarkup = (
				<div className="spotify-player">
					<iframe src={artistEmbedUrl} width="300" height="380" frameBorder="0" allowTransparency="true"/>
				</div>
			);
			albumsListMarkup = albums.map((album, index) => {
				return (
					<div className="album" key={album.id}>
						<a href="javascript:void(0);" onClick={(evt) => this.albumClickHandler(evt, index)}>{album.name}</a>
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
