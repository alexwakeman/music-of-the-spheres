import * as React from 'react';

export function SearchInputComponent({searchTerm, handleSearch, handleSearchTermUpdate}) {
    return (
        <div className="search-form-container">
            <form className="artist-search" onSubmit={(evt) => handleSearch(evt, searchTerm)}>
                <input type="text" id="search-input" placeholder="e.g. Jimi Hendrix" value={searchTerm} onChange={handleSearchTermUpdate} />
                <button type="submit" onClick={(evt) => handleSearch(evt, searchTerm)}>Go</button>
            </form>
        </div>
    );
}
