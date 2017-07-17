import { connect } from 'react-redux';
import { SearchInputComponent } from '../components/search-input.component.jsx';
import { MusicDataService } from '../services/music-data.service';
import {clearSession, updateSearchTerm} from '../state/actions';

const mapStateToProps = (state) => {
	return {
		searchTerm: state.searchTerm,
		artist: state.artist
	}
};

const mapDispatchToProps = (dispatch) => {
	return {
		handleSearch: (evt, artistName) => {
			evt.preventDefault();
			MusicDataService.search(artistName);
		},
		handleSearchTermUpdate: (evt) => {
			dispatch(updateSearchTerm(evt.target.value));
		},
		clearSession: (evt) => {
			evt.preventDefault();
			dispatch(clearSession());
		}
	}
};

const SearchContainer = connect(mapStateToProps, mapDispatchToProps)(SearchInputComponent);

export default SearchContainer;
