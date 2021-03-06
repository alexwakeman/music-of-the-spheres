import { connect } from 'react-redux';
import {ArtistInfoComponent} from '../components/artist-info.component';

const mapStateToProps = (state) => {
	return {
		artist: state.artist,
		showUI: state.showUI
	}
};

const ArtistInfoContainer = connect(mapStateToProps)(ArtistInfoComponent);

export default ArtistInfoContainer;
