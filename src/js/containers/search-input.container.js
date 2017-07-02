import { connect } from 'react-redux';
import { SearchInputComponent } from '../components/search-input.component';
import { startSearch } from "../state/actions";

const mapStateToProps = state => {
	return {
		searchTerm: state.searchTerm
	}
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		handleSearch: () => {
			dispatch(startSearch(ownProps.searchTerm))
		}
	}
};

const SearchContainer = connect({
	mapStateToProps,
	mapDispatchToProps
})(SearchInputComponent);

export default SearchContainer;