import * as React from 'react';
import {store} from '../state/store';
import TrigUtils from "../classes/trig-utils.class";
import ThreeScene from "../classes/three-scene.class";

export class SceneComponent extends React.Component {
	artist;
	sceneDom;
	threeScene = new ThreeScene();

	constructor() {
		super();
		this.assignMouseWheel();
		this.artist = store.getState().artist;
		store.subscribe(() => {
			this.artist = store.getState().artist;
			this.forceUpdate();
		});
	}

	render() {
		return (
			<div className="three-scene"
				 ref={elem => this.sceneDom = elem}
				 onClick={this.onClickHandler}
				 onMouseMove={this.onMouseMoveHandler}
				 onMouseDown={this.onMouseDownHandler}
				 onMouseUp={this.onMouseUpHandler}
			/>
		)
	}

	componentDidMount() {
		this.sceneDom.addEventListener('mousewheel', (event) => {
			switch (TrigUtils.sign(event.wheelDeltaY)) {
				case -1:
					this.threeScene.zoom('out');
					break;
				case 1:
					this.threeScene.zoom('in');
					break;
			}
		}, true);
	}

	onClickHandler() {

	}

	onMouseMoveHandler(event) {
		this.threeScene.onSceneMouseMove(event);
	}

	onMouseDownHandler() {

	}

	onMouseUpHandler() {

	}

	assignMouseWheel() {

	}
}
