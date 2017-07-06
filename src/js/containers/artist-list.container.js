import { connect } from 'react-redux';
import {ArtistListComponent} from "../components/artist-list.component";
import {MusicDataService} from "../services/music-data.service";

const mapStateToProps = (state) => {
	return {
		visitedArtists: state.visitedArtists
	}
};

const mapDispatchToProps = () => {
	return {
		handleGetArtist: (evt, artistId) => {
			evt.preventDefault();
			MusicDataService.getArtist(artistId);
		},
	}
};

const ArtistListContainer = connect(mapStateToProps, mapDispatchToProps)(ArtistListComponent);

export default ArtistListContainer;
