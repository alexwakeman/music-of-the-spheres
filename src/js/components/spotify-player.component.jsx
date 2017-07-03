import * as React from 'react';
import {store} from '../state/store';

export function SpotifyPlayerComponent() {
	const embedUrl = 'https://open.spotify.com/embed/artist/';
	let artistEmbedUrl = `${embedUrl}${store.getState().artist.id}`;
	store.subscribe(() => {
		artistEmbedUrl = `${embedUrl}${store.getState().artist.id}`;
	});
    return (
        <iframe src={artistEmbedUrl} width="300" height="80" />
    )
}