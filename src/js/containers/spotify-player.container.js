import { connect } from 'react-redux';
import {SpotifyPlayerComponent} from "../components/spotify-player.component";
import {loadAlbum} from "../state/actions";

const mapStateToProps = (state) => {
	return {
		isHidden: state.hideInfo,
		displayAlbums: state.displayAlbums,
		displayAlbumIndex: state.displayAlbumIndex
	}
};

const mapDispatchToProps = (dispatch) => {
	return {
		albumClickHandler: (evt, album) => {
			evt.preventDefault();
			dispatch(loadAlbum(album));
		}
	}
};

const SpotifyPlayerContainer = connect(mapStateToProps, mapDispatchToProps)(SpotifyPlayerComponent);

export default SpotifyPlayerContainer;
