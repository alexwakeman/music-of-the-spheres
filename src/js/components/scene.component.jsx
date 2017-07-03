import * as React from 'react';
import {store} from '../state/store';

export function SceneComponent() {
	let artist = store.getState().artist;
	store.subscribe(() => {
		artist = store.getState().artist;
	});
    return (
		<div id="three-scene">{artist.name}</div>
	)
}
