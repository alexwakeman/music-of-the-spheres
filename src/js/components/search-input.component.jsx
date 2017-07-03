import * as React from 'react';

export function SearchInputComponent({searchTerm, handleSearch, handleSearchTermUpdate}) {
    return (
        <div className="search-form-container">
            <form className="artist-search" onSubmit={() => handleSearch()}>
                <input type="text" id="search-input" placeholder="e.g. Jimi Hendrix" value={searchTerm} onKeyPress={() => handleSearchTermUpdate()} />
                <button type="submit" onClick={() => handleSearch()}>Go</button>
            </form>
        </div>
    );
}
