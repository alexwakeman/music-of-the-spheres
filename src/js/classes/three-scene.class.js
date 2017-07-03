import {Object3D, PerspectiveCamera, Projector, Scene, WebGLRenderer} from "three";

export default class ThreeScene {
    renderer = new WebGLRenderer({antialias: true, alpha: true});
    scene = new Scene();
    camera = new PerspectiveCamera(30, window.innerWidth / window.innerHeight, 500, 150000);
    projector = new Projector();
    graphContainer = new Object3D();
    container;

    constructor(boundingBox) {
        this.container = boundingBox;
    }
}