import { connect } from 'react-redux';
import {SpotifyPlayerComponent} from "../components/spotify-player.component";

const mapStateToProps = (state) => {
	return {
		artist: state.artist,
		isHidden: state.hideInfo
	}
};

const SpotifyPlayerContainer = connect(mapStateToProps)(SpotifyPlayerComponent);

export default SpotifyPlayerContainer;
