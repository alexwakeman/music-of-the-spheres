import * as THREE from 'three';
export const Props = {
	renderer: new THREE.WebGLRenderer({antialias: true, alpha: true}),
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 500, 150000),
	graphContainer: new THREE.Object3D(),
	textContainer: new THREE.Object3D(),
	parent: new THREE.Object3D(),
	artistSceneRotation: new THREE.Euler(0, 0, 0),
	cameraLookAt: new THREE.Vector3(0, 0, 0),
	cameraDistance: 3500,
	
	t1: 0.0, // old time
	t2: 0.0, // now time
	speedX: 0.000,
	speedY: 0.005,
	mousePosDiffX: 0.0,
	mousePosDiffY: 0.0,
	mousePosXIncreased: false,
	mousePosYIncreased: false,
	raycaster: new THREE.Raycaster(),
	mouseVector: new THREE.Vector2(),

	sceneSetIndex: 0
};

// a way of encapsulating the non-connected spheres and text meshes.
// no longer using parent->child relationship
export class ArtistProps {
	static assign(mainArtistSphere, relatedArtistSpheres) {
		this.mainArtistSphere = mainArtistSphere;
		this.relatedArtistSpheres = relatedArtistSpheres;
        Props.graphContainer.add(this.mainArtistSphere);
		Props.textContainer.add(this.mainArtistSphere.textMesh);
		this.relatedArtistSpheres.forEach(related => {
            Props.graphContainer.add(related);
			Props.textContainer.add(related.textMesh);
		});
	}

	static removeRelatedArtistFromScene(relatedSphere) {
        Props.textContainer.remove(relatedSphere.textMesh);
        Props.graphContainer.remove(relatedSphere);
	}
}

export const MAIN_ARTIST_SPHERE = 'MAIN_ARTIST_SPHERE';
export const RELATED_ARTIST_SPHERE = 'RELATED_ARTIST_SPHERE';
export const MAIN_ARTIST_TEXT = 'MAIN_ARTIST_TEXT';
export const RELATED_ARTIST_TEXT = 'RELATED_ARTIST_TEXT';
export const CONNECTING_LINE = 'CONNECTING_LINE';