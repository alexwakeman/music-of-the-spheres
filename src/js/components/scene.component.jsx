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
		this.sceneDom.addEventListener('contextmenu', event => event.preventDefault()); // remove right click
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
		if (!this.isDragging) {
			this.scene.onSceneMouseClick(event);
		} else {
			this.isDragging = false;
		}
	}

	mousemove(event) {
		let isOverRelated = false;
		this.sceneDom.className = 'spheres-scene grab';
		if (this.mouseIsDown) {
			this.isDragging = true;
			this.scene.onSceneMouseDrag(event);
		} else {
			isOverRelated = this.scene.onSceneMouseHover(event);
		}
		if (isOverRelated && !this.isDragging) {
			this.sceneDom.className = 'spheres-scene pointer';
		}
		if (this.isDragging) {
			this.sceneDom.className = 'spheres-scene grabbed';
		}
	}

	mousedown() {
		this.mouseIsDown = true;
	}

	mouseup() {
		this.sceneDom.className = 'spheres-scene grab';
		window.setTimeout(() => {
			this.mouseIsDown = false;
		}, 100);
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
