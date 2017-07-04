import * as React from 'react';
import {store} from '../state/store';
import TrigUtils from "../classes/trig-utils.class";
import ThreeScene from "../classes/three-scene.class";

export class SceneComponent extends React.Component {
	artist;
	sceneDom;
	threeScene;

	constructor() {
		super();
		this.artist = store.getState().artist;
		store.subscribe(() => {
			this.artist = store.getState().artist;
			this.forceUpdate();
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
			<div className="three-scene"
				 ref={elem => this.sceneDom = elem}
				 onClick={this.onClickHandler}
			/>
		)
	}

	componentDidMount() {
		this.threeScene = new ThreeScene(this.sceneDom);
		this.sceneDom.addEventListener('mousewheel', this.handleMouseWheel, true);
		this.sceneDom.addEventListener('mousemove', this.onMouseHoverHandler, true);
		this.sceneDom.addEventListener('mousedown', this.onMouseDownHandler, true);
		this.sceneDom.addEventListener('mouseup', this.onMouseUpHandler, true);
		window.addEventListener('resize', this.onWindowResize, false);
	}

	onClickHandler(event) {
		this.threeScene.onSceneMouseClick(event)
	}

	onMouseHoverHandler(event) {
		this.threeScene.onSceneMouseHover(event);
	}

	onMouseDragHandler(event) {
		this.threeScene.onSceneMouseDrag(event);
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
		switch (TrigUtils.sign(event.wheelDeltaY)) {
			case -1:
				this.threeScene.zoom('out');
				break;
			case 1:
				this.threeScene.zoom('in');
				break;
		}
	}

	onWindowResize() {
		this.threeScene.camera.aspect = window.innerWidth / window.innerHeight;
		this.threeScene.updateProjectionMatrix();
		this.threeScene.renderer.setSize(window.innerWidth, window.innerHeight);
	}
}
