import * as React from 'react';

export function ArtistInfoComponent({artist, showUI}) {
    const genres = artist.genres.map((genre) => {
        return <span className="pill" key={genre}>{genre}</span>
    });
    const classes = showUI ? 'info-container main' : 'hidden info-container main';
    return (
        <div className={classes}>
            <div className="artist-name-tag main">{artist.name}</div>
            <div className="popularity"><span className="title">Popularity:</span>
                <span className="pill">{artist.popularity}</span></div>
            <div className="genres">{genres}</div>
        </div>
    )
}
