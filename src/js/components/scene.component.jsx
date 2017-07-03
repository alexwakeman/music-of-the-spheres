import * as React from 'react';
import {store} from '../state/store';

export class SceneComponent extends React.Component {
	artist;
	constructor() {
		super();
		this.artist = store.getState().artist;
		store.subscribe(() => {
			this.artist = store.getState().artist;
			this.forceUpdate();
		});
	}
	render() {
		return (
			<div id="three-scene">{this.artist.name}</div>
		)
	}

}
