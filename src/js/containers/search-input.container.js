import { connect } from 'react-redux';
import { SearchInputComponent } from '../components/search-input.component.jsx';
import {MusicDataService} from "../services/music-data.service";
import {updateSearchTerm} from "../state/actions";

const mapStateToProps = (state) => {
	return {
		searchTerm: state.searchTerm
	}
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		handleSearch: () => {
			MusicDataService.getMainArtistData(ownProps.searchTerm);
		},
		handleSearchTermUpdate: () => {
			dispatch(updateSearchTerm(ownProps.searchTerm));
		}
	}
};

const SearchContainer = connect(
	mapStateToProps,
	mapDispatchToProps)(SearchInputComponent);

export default SearchContainer;