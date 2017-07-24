import * as THREE from "three";
export const Props = {
	renderer: new THREE.WebGLRenderer({antialias: true, alpha: true}),
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 500, 150000),
	graphContainer: new THREE.Object3D(),
	cameraRotation: new THREE.Euler(0, -1, 0),
	cameraLookAt: new THREE.Vector3(0, 0, 0),
	cameraDistance: 3500,
	
	t1: 0.0, // old time
	t2: 0.0, // now time
	speedX: 0.005,
	speedY: 0.000,
	mousePosDiffX: 0.0,
	mousePosDiffY: 0.0,
	mousePosXIncreased: false,
	mousePosYIncreased: false,
	raycaster: new THREE.Raycaster(),
	mouseVector: new THREE.Vector2(),
	
	relatedArtistSpheres: [],
	mainArtistSphere: {}
};

export const MAIN_ARTIST_SPHERE = 'MAIN_ARTIST_SPHERE';
export const RELATED_ARTIST_SPHERE = 'RELATED_ARTIST_SPHERE';
export const TEXT_GEOMETRY = 'TEXT_GEOMETRY';
export const CONNECTING_LINE = 'CONNECTING_LINE';