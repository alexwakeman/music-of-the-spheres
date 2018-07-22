import {connect} from 'react-redux';
import {SpotifyPlayerComponent} from "../components/spotify-player.component";
import {loadAlbum} from "../state/actions";

const mapStateToProps = (state) => {
    return {
        showUI: state.showUI,
        displayArtist: state.displayArtist,
        displayAlbumIndex: state.displayAlbumIndex
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        albumClickHandler: (evt, albumIndex) => {
            evt.preventDefault();
            dispatch(loadAlbum(albumIndex));
        }
    }
};

const SpotifyPlayerContainer = connect(mapStateToProps, mapDispatchToProps)(SpotifyPlayerComponent);

export default SpotifyPlayerContainer;
