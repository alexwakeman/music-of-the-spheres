import {Object3D, PerspectiveCamera, Projector, Scene, WebGLRenderer} from "three";

export default class ThreeScene {
    renderer;
    scene;
    camera;
    projector;
    graphContainer;
    container;

    constructor(boundingBox) {
        this.container = boundingBox;
		this.renderer = new WebGLRenderer({antialias: true, alpha: true});
		this.scene = new Scene();
		this.camera = new PerspectiveCamera(30, window.innerWidth / window.innerHeight, 500, 150000);
		this.projector = new Projector();
		this.graphContainer = new Object3D();
    }
}