import * as React from 'react';
import {SceneComponent} from "./scene.component.jsx";
import {SearchInputComponent} from "./search-input.component.jsx";
import {SpotifyPlayerComponent} from "./spotify-player.component.jsx";
import {ArtistListComponent} from "./artist-list.component";
import {ArtistInfoComponent} from "./artist-info.component";
import SearchContainer from "../containers/search-input.container";

export class AppComponent extends React.Component {

    constructor() {
        super();
    }

    render() {
        return (
            <div className="app-container">
				<SearchContainer>
                	<SearchInputComponent  />
				</SearchContainer>
                <SceneComponent/>
                <SpotifyPlayerComponent />
                <ArtistListComponent />
                <ArtistInfoComponent />
            </div>
        )
    }
}
