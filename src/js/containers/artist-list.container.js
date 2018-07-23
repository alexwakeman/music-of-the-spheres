import {connect} from 'react-redux';
import {ArtistListComponent} from "../components/artist-list.component";
import {MusicDataService} from "../services/music-data.service";
import {sliceExploredArtists} from '../state/actions';

const mapStateToProps = (state) => {
    return {
        visitedArtists: state.visitedArtists,
        showUI: state.showUI
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        handleSliceExploredArtists: (index) => {
            dispatch(sliceExploredArtists(index));
        }
    }
};


const ArtistListContainer = connect(mapStateToProps, mapDispatchToProps)(ArtistListComponent);

export default ArtistListContainer;
