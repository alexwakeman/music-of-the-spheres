import { connect } from 'react-redux';
import { ArtistListComponent } from '../components/artist-list.component';

const mapStateToProps = state => {
	return {
		artistList: state.visitedArtists
	}
};

const CurrentArtist = connect({
	mapStateToProps
})(ArtistListComponent);

export default CurrentArtist;