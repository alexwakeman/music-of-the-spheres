import * as React from 'react';
import PropTypes from 'prop-types';

export function SearchInputComponent ({term, handleSearch}) {
    return (
        <div className="search-form-container">
            <form className="artist-search" onSubmit={() => handleSearch(event)}>
                <input type="text" id="search-input" placeholder="e.g. Jimi Hendrix" value={term} />
                <button type="submit" onClick={() => handleSearch(event)}>Go</button>
            </form>
        </div>
    );
}

SearchInputComponent.propTypes = {
	term: PropTypes.string,
	handleSearch: PropTypes.func.required
};
