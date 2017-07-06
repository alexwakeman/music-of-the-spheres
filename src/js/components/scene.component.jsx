import * as React from 'react';
import {store} from '../state/store';
import {SceneUtils} from "../classes/scene-utils.class";
import {SpheresScene} from "../classes/spheres-scene.class";

export class SceneComponent extends React.Component {
	constructor() {
		super();
		this.artist = store.getState().artist;
		this.mouseIsDown = false;
	}

	render() {
		const { artist } = this.props;
		if (artist.id) {
			this.scene.composeScene(artist);
		}
		return (
			<div className="spheres-scene"
				 ref={elem => this.sceneDom = elem}
			/>
		)
	}

	componentDidMount() {
		this.scene = new SpheresScene(this.sceneDom);
		this.sceneDom.addEventListener('click', this, true);
		this.sceneDom.addEventListener('mousewheel', this, true);
		this.sceneDom.addEventListener('mousemove', this, true);
		this.sceneDom.addEventListener('mousedown', this, true);
		this.sceneDom.addEventListener('mouseup', this, true);
		window.addEventListener('resize', this, false);
	}

	handleEvent(event) {
		this[event.type](event);
	}

	click(event) {
		this.scene.onSceneMouseClick(event)
	}

	mousemove(event) {
		if (this.mouseIsDown) {
			this.scene.onSceneMouseDrag(event);
		} else {
			this.scene.onSceneMouseHover(event);
		}
	}

	mousedown() {
		this.mouseIsDown = true;
	}

	mouseup() {
		this.mouseIsDown = false;
	}

	mousewheel(event) {
		switch (SceneUtils.sign(event.wheelDeltaY)) {
			case -1:
				this.scene.zoom('out');
				break;
			case 1:
				this.scene.zoom('in');
				break;
		}
	}

	resize() {
		this.scene.updateCameraAspect();
	}
}
