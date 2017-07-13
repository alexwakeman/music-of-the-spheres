import { connect } from 'react-redux';
import {RelatedArtistInfoComponent} from '../components/related-artist-info.component';

const mapStateToProps = (state) => {
	return {
		relatedArtist: state.relatedArtist,
		showRelated: state.showRelated
	}
};

const RelatedArtistInfoContainer = connect(mapStateToProps)(RelatedArtistInfoComponent);

export default RelatedArtistInfoContainer;
