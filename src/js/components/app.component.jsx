import * as React from 'react';
import {SceneComponent} from "./scene.component.jsx";
import {SearchInputComponent} from "./search-input.component.jsx";
import {SpotifyPlayerComponent} from "./spotify-player.component.jsx";
import {ArtistListComponent} from "./artist-list.component";
import {ArtistInfoComponent} from "./artist-info.component";

export class AppComponent extends React.Component {

    constructor() {
        super();
    }

    render() {
        return (
            <div className="app-container">
                <SearchInputComponent />
                <SceneComponent/>
                <SpotifyPlayerComponent />
                <ArtistListComponent />
                <ArtistInfoComponent />
            </div>
        )
    }
}
