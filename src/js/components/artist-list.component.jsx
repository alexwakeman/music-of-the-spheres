import * as React from 'react';
import {Props} from '../classes/props';

export class ArtistListComponent extends React.Component {
	constructor() {
		super();
	}

	handleGetArtist(evt, artistId) {
		evt.preventDefault();
        Props.sceneInst.navigateBackFromList(artistId);
	}

	render() {
		let artists = this.props.visitedArtists.map((artist) => {
			let href = '/app/#' + encodeURIComponent(artist.id);
			let imgUrl = artist.images && artist.images.length ? artist.images[artist.images.length - 1].url : '';
			let imgStyle = { backgroundImage: `url(${imgUrl})` };
			return (
				<div className="artist" key={artist.id}>
					<a href={href} id={artist.id} className="nav-artist-link"
					   onClick={(event) => { this.handleGetArtist(event, artist.id) }}>
						<div className="picture-holder">
							<div className="picture" style={imgStyle} />
						</div>
						<span className="name">{artist.name}</span>
					</a>
				</div>
			)
		});
		const classes = this.props.showUI ? 'artist-navigation' : 'hidden artist-navigation';
		return (
			<div className={classes} ref={elem => this.artistListDom = elem}>
				{artists}
			</div>
		)
	}

	componentDidMount() {
		this.artistListDom.scrollTop = this.artistListDom.scrollHeight;
	}

	componentDidUpdate() {
		this.artistListDom.scrollTop = this.artistListDom.scrollHeight;
	}
}
