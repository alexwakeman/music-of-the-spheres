import { connect } from 'react-redux';
import {ArtistListComponent} from "../components/artist-list.component";
import {MusicDataService} from "../services/music-data.service";

const mapStateToProps = (state) => {
	return {
		visitedArtists: state.visitedArtists,
		isHidden: state.hideInfo
	}
};


const ArtistListContainer = connect(mapStateToProps)(ArtistListComponent);

export default ArtistListContainer;
