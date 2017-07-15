import { connect } from 'react-redux';
import {RelatedArtistInfoComponent} from '../components/related-artist-info.component';

const mapStateToProps = (state) => {
	return {
		relatedArtist: state.relatedArtist,
		hideRelated: state.hideRelated,
		hideInfo: state.hideInfo
	}
};

const RelatedArtistInfoContainer = connect(mapStateToProps)(RelatedArtistInfoComponent);

export default RelatedArtistInfoContainer;
