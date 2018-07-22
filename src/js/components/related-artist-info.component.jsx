import * as React from 'react';
import {Props} from '../classes/props';

export function RelatedArtistInfoComponent({relatedArtist, showUI, showRelated, showExploreButton}) {
    const showRelatedClass = showRelated && showUI ? 'info-container related' : 'hidden info-container related';
    const showExploreButtonClass = showExploreButton ? 'explore-container' : 'hidden explore-container';
    return (
        <div className={showRelatedClass}>
            <div className="artist-name-tag related">{relatedArtist.name}</div>
            <div className="popularity"><span className="title">Popularity:</span>
                <span className="pill">{relatedArtist.popularity}</span></div>
            <div className="genres"><span className="title">Genre similarity:</span>
                <span className="pill">{relatedArtist.genreSimilarity}%</span></div>
            <div className={showExploreButtonClass}>
                <button onClick={(evt) => Props.sceneInst.exploreSelectedArtist()}>Explore</button>
            </div>
        </div>
    )
}
