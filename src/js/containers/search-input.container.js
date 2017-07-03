import { connect } from 'react-redux';
import { SearchInputComponent } from '../components/search-input.component';
import {MusicDataService} from "../services/music-data.service";
import {updateSearchTerm} from "../state/actions";

const mapStateToProps = state => {
	return {
		searchTerm: state.searchTerm
	}
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		handleSearch: () => {
			MusicDataService.getMainArtistData(ownProps.searchTerm);
		},
		handleSearchTermUpdate: (event) => {
			dispatch(updateSearchTerm(event.target.value));
		}
	}
};

const SearchContainer = connect({
	mapStateToProps,
	mapDispatchToProps
})(SearchInputComponent);

export default SearchContainer;