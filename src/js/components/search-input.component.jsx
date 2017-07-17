import * as React from 'react';

export function SearchInputComponent({searchTerm, artist, handleSearch, handleSearchTermUpdate, clearSession}) {
    const clearBtnClass = artist.id ? 'clear-session' : 'hidden clear-session';
    return (
        <div className="search-form-container">
            <form className="artist-search" onSubmit={(evt) => handleSearch(evt, searchTerm)}>
                <input type="text" id="search-input" placeholder="e.g. Jimi Hendrix" value={searchTerm} onChange={handleSearchTermUpdate} />
                <button type="submit" onClick={(evt) => handleSearch(evt, searchTerm)}>Go</button>
                <button className={clearBtnClass} type="button" onClick={(evt) => clearSession(evt)}>Clear Session</button>
            </form>
        </div>
    );
}
