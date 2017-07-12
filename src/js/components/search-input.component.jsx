import * as React from 'react';

export function SearchInputComponent({searchTerm, isHidden, handleSearch, handleSearchTermUpdate}) {
	const classes = isHidden ? 'hidden search-form-container' : 'search-form-container';
    return (
        <div className={classes}>
            <form className="artist-search" onSubmit={(evt) => handleSearch(evt, searchTerm)}>
                <input type="text" id="search-input" placeholder="e.g. Jimi Hendrix" value={searchTerm} onChange={handleSearchTermUpdate} />
                <button type="submit" onClick={(evt) => handleSearch(evt, searchTerm)}>Go</button>
            </form>
        </div>
    );
}
