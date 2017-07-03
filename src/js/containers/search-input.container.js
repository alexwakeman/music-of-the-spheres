import { connect } from 'react-redux';
import { SearchInputComponent } from '../components/search-input.component.jsx';
import {MusicDataService} from "../services/music-data.service";
import {updateSearchTerm} from "../state/actions";

const mapStateToProps = (state) => {
	return {
		searchTerm: state.searchTerm
	}
};

const mapDispatchToProps = (dispatch) => {
	return {
		handleSearch: (evt, searchTerm) => {
			evt.preventDefault();
			MusicDataService.getMainArtistData(searchTerm);
		},
		handleSearchTermUpdate: (evt) => {
			dispatch(updateSearchTerm(evt.target.value));
		}
	}
};

const SearchContainer = connect(
	mapStateToProps,
	mapDispatchToProps)(SearchInputComponent);

export default SearchContainer;