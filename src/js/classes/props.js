import * as THREE from "three";
export const Props = {
	renderer: new THREE.WebGLRenderer({antialias: true, alpha: true}),
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 500, 150000),
	graphContainer: new THREE.Object3D(),
	cameraRotation: new THREE.Euler(0, 0, 0),
	cameraLookAt: new THREE.Vector3(1, 1, 1),
	cameraDistance: 3500,
	
	t1: 0.0, // old time
	t2: 0.0, // now time
	speedX: 0.005,
	speedY: 0.005,
	mousePosDiffX: 0.0,
	mousePosDiffY: 0.0,
	mousePosXIncreased: false,
	mousePosYIncreased: false,
	raycaster: new THREE.Raycaster(),
	mouseVector: new THREE.Vector2(),
	
	relatedArtistSpheres: [],
	mainArtistSphere: {}
};