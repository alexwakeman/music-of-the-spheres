import * as React from 'react';
import {store} from '../state/store';
import {SceneUtils} from '../classes/scene-utils.class';
import {SpheresScene} from '../classes/scene-interactions.class';
import {Props} from '../classes/props';

export class SceneComponent extends React.Component {
    constructor() {
        super();
        this.artist = store.getState().artist;
        this.mouseIsDown = false;
    }

    render() {
        return (
            <div className="spheres-scene" ref={elem => this.sceneDom = elem}/>
        )
    }

    componentDidMount() {
        SceneUtils.init().then(() => { // load the font first (async)
            Props.sceneInst = new SpheresScene(this.sceneDom);
            this.initScene();
        });
    }

    componentDidUpdate() {
        this.initScene();
    }

    initScene() {
        this.sceneDom.addEventListener('contextmenu', event => event.preventDefault()); // remove right click
        this.sceneDom.addEventListener('click', this, true); // use handleEvent callback [JS default] (it's attached to `this`)
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
        this.sceneDom.className = 'spheres-scene grab';
        if (!this.isDragging) {
            Props.sceneInst.onSceneMouseClick(event);
        } else {
            this.isDragging = false;
        }
    }

    mousemove(event) {
        let isOverRelated = false;
        this.sceneDom.className = 'spheres-scene grab';
        if (this.mouseIsDown) {
            this.isDragging = true;
            Props.sceneInst.onSceneMouseDrag(event);
        } else {
            isOverRelated = Props.sceneInst.onSceneMouseHover(event);
        }
        if (isOverRelated && !this.isDragging) {
            this.sceneDom.className = 'spheres-scene pointer';
            return;
        }
        if (this.isDragging) {
            this.sceneDom.className = 'spheres-scene grabbed';
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
                Props.sceneInst.zoom('out');
                break;
            case 1:
                Props.sceneInst.zoom('in');
                break;
        }
    }

    resize() {
        Props.sceneInst.updateCameraAspect();
    }
}
