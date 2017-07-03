import { connect } from 'react-redux';
import {ArtistListComponent} from "../components/artist-list.component";

const mapStateToProps = (state) => {
	return {
		visitedArtists: state.visitedArtists
	}
};

const ArtistListContainer = connect(mapStateToProps)(ArtistListComponent);

export default ArtistListContainer;
