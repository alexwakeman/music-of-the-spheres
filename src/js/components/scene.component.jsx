import * as React from 'react';
import {store} from '../state/store';
import {SceneUtils} from "../classes/scene-utils.class";
import {SpheresScene} from "../classes/spheres-scene.class";

export class SceneComponent extends React.Component {
	artist;
	sceneDom;
	scene;

	constructor() {
		super();
		this.artist = store.getState().artist;
		store.subscribe(() => {
			this.artist = store.getState().artist;
			this.scene.composeScene(artist);
		});
		this.onClickHandler.bind(this);
		this.onMouseHoverHandler.bind(this);
		this.onMouseDragHandler.bind(this);
		this.onMouseDownHandler.bind(this);
		this.onMouseUpHandler.bind(this);
		this.handleMouseWheel.bind(this);
		this.onWindowResize.bind(this);
	}

	render() {
		return (
			<div className="spheres-scene"
				 ref={elem => this.sceneDom = elem}
				 onClick={this.onClickHandler}
			/>
		)
	}

	componentDidMount() {
		this.scene = new SpheresScene(this.sceneDom);
		this.sceneDom.addEventListener('mousewheel', this.handleMouseWheel, true);
		this.sceneDom.addEventListener('mousemove', this.onMouseHoverHandler, true);
		this.sceneDom.addEventListener('mousedown', this.onMouseDownHandler, true);
		this.sceneDom.addEventListener('mouseup', this.onMouseUpHandler, true);
		window.addEventListener('resize', this.onWindowResize, false);
	}

	onClickHandler(event) {
		this.scene.onSceneMouseClick(event)
	}

	onMouseHoverHandler(event) {
		this.scene.onSceneMouseHover(event);
	}

	onMouseDragHandler(event) {
		this.scene.onSceneMouseDrag(event);
	}

	onMouseDownHandler() {
		this.sceneDom.removeEventListener('mousemove', this.onMouseHoverHandler);
		this.sceneDom.addEventListener('mousemove', this.onMouseDragHandler, true);
	}

	onMouseUpHandler() {
		this.sceneDom.removeEventListener('mousemove', this.onMouseDragHandler);
		this.sceneDom.addEventListener('mousemove', this.onMouseHoverHandler, true);
	}

	handleMouseWheel(event) {
		switch (SceneUtils.sign(event.wheelDeltaY)) {
			case -1:
				this.scene.zoom('out');
				break;
			case 1:
				this.scene.zoom('in');
				break;
		}
	}

	onWindowResize() {
		this.scene.camera.aspect = window.innerWidth / window.innerHeight;
		this.scene.updateProjectionMatrix();
		this.scene.renderer.setSize(window.innerWidth, window.innerHeight);
	}
}
