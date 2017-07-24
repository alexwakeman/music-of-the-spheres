import * as THREE from "three";
import {Colours} from '../config/colours';
import {CONNECTING_LINE, MAIN_ARTIST_SPHERE, RELATED_ARTIST_SPHERE, TEXT_GEOMETRY, Props} from "./props";
import {Statistics} from "./statistics.class";

let HELVETIKER;
const MAIN_ARTIST_FONT_SIZE = 34;
const RELATED_ARTIST_FONT_SIZE = 20;
const TOTAL_RELATED = 5;

class SceneUtils {
	static init() {
		return new Promise((resolve, reject) => {
			const loader = new THREE.FontLoader();
			loader.load('./js/fonts/helvetiker_regular.typeface.json', (font) => {
				HELVETIKER = font;
				resolve();
			}, ()=>{}, reject);
		});
	}
	/**
	 *
	 * @param a - min
	 * @param b - max
	 * @param c - value to clamp
	 * @returns {number}
	 */
	static clamp(a, b, c) {
		return Math.max(b, Math.min(c, a));
	}

	/**
	 * Given positive x return 1, negative x return -1, or 0 otherwise
	 * @param n
	 * @returns {number}
	 */
	static sign(n) {
		return n > 0 ? 1 : n < 0 ? -1 : 0;
	};
	
	static renormalizeQuaternion(object) {
		let clone = object.clone();
		let q = clone.quaternion;
		let magnitude = Math.sqrt(Math.pow(q.w, 2) + Math.pow(q.x, 2) + Math.pow(q.y, 2) + Math.pow(q.z, 2));
		q.w /= magnitude;
		q.x /= magnitude;
		q.y /= magnitude;
		q.z /= magnitude;
		return q;
	}

	static getIntersectsFromMousePos() {
		Props.raycaster.setFromCamera(Props.mouseVector, Props.camera);
		return Props.raycaster.intersectObjects(Props.graphContainer.children, true);
	}

	static getMouseVector(event) {
		return new THREE.Vector2((event.clientX / Props.renderer.domElement.clientWidth) * 2 - 1,
			-(event.clientY / Props.renderer.domElement.clientHeight) * 2 + 1);
	}

	static createMainArtistSphere(artist) {
		let radius = Statistics.getArtistSphereSize(artist);
		let geometry = new THREE.SphereGeometry(radius, 35, 35);
		let sphere = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: Colours.mainArtist}));
		sphere.artistObj = artist;
		sphere.radius = radius;
		sphere.type = MAIN_ARTIST_SPHERE;
		SceneUtils.addText(artist.name, MAIN_ARTIST_FONT_SIZE, sphere);
		return sphere;
	}

	static createRelatedSpheres(artist, mainArtistSphere) {
		let relatedArtistsSphereArray = [];
		let relatedArtist;
		let sphereFaceIndex = 0;
		let facesCount = mainArtistSphere.geometry.faces.length - 1;
		let step = Math.round(facesCount / TOTAL_RELATED - 1);

		for (let i = 0, len = Math.min(TOTAL_RELATED, artist.related.length); i < len; i++) {
			relatedArtist = artist.related[i];
			let radius = Statistics.getArtistSphereSize(relatedArtist);
			let geometry = new THREE.SphereGeometry(radius, 35, 35);
			let relatedArtistSphere = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: Colours.relatedArtist}));
			let genreMetrics = Statistics.getSharedGenreMetric(artist, relatedArtist);
			relatedArtistSphere.artistObj = relatedArtist;
			relatedArtistSphere.artistObj.genreSimilarity = genreMetrics.genreSimilarity;
			relatedArtistSphere.distance = genreMetrics.lineLength;
			relatedArtistSphere.radius = radius;
			relatedArtistSphere.type = RELATED_ARTIST_SPHERE;
			sphereFaceIndex += step;
			SceneUtils.positionRelatedArtist(mainArtistSphere, relatedArtistSphere, sphereFaceIndex);
			SceneUtils.joinRelatedArtistSphereToMain(mainArtistSphere, relatedArtistSphere);
			SceneUtils.addText(relatedArtist.name, RELATED_ARTIST_FONT_SIZE, relatedArtistSphere);
			relatedArtistsSphereArray.push(relatedArtistSphere);
		}
		return relatedArtistsSphereArray;
	}

	static appendObjectsToScene(graphContainer, sphere, sphereArray) {
		const parent = new THREE.Object3D();
		parent.name = 'parent';
		parent.add(sphere);
		if (sphereArray) {
			for (let i = 0; i < sphereArray.length; i++) {
				parent.add(sphereArray[i]);
			}
		}
		graphContainer.add(parent);
	}

	static joinRelatedArtistSphereToMain(mainArtistSphere, relatedSphere) {
		let material = new THREE.LineBasicMaterial({color: Colours.relatedLineJoin});
		let geometry = new THREE.Geometry();
		let line;
		geometry.vertices.push(new THREE.Vector3(0, 0, 0));
		geometry.vertices.push(relatedSphere.position.clone());
		line = new THREE.Line(geometry, material);
		line.type = CONNECTING_LINE;
		mainArtistSphere.add(line);
	}

	static positionRelatedArtist(mainArtistSphere, relatedSphere, sphereFaceIndex) {
		let mainArtistSphereFace = mainArtistSphere.geometry.faces[Math.floor(sphereFaceIndex)].normal.clone();
		relatedSphere.position
			.copy(mainArtistSphereFace.multiply(new THREE.Vector3(
					relatedSphere.distance,
					relatedSphere.distance,
					relatedSphere.distance
				)
			)
		);
	}

	static addText(label, size, sphere) {
		let materialFront = new THREE.MeshBasicMaterial({color: Colours.textOuter});
		let materialSide = new THREE.MeshBasicMaterial({color: Colours.textInner});
		let materialArray = [materialFront, materialSide];
		let textGeom = new THREE.TextGeometry(label, {
			font: HELVETIKER,
			size: size,
			curveSegments: 4,
			bevelEnabled: true,
			bevelThickness: 2,
			bevelSize: 1,
			bevelSegments: 3
		});
		let textMesh = new THREE.Mesh(textGeom, materialArray);
		let cameraNorm = Props.camera.position.clone().normalize();
		textMesh.type = TEXT_GEOMETRY;
		sphere.add(textMesh);
		textMesh.position.set(
			cameraNorm.x * sphere.radius,
			cameraNorm.y * sphere.radius,
			cameraNorm.z * sphere.radius
		);
		textMesh.lookAt(Props.graphContainer.worldToLocal(Props.camera.position));
	}

	static lighting() {
		let lightA = new THREE.DirectionalLight(0xcccccc, 1.725);
		let lightB = new THREE.DirectionalLight(0xaaaaaa, 1.5);
		lightA.position.setX(500);
		lightB.position.setY(-800);
		lightB.position.setX(-500);
		Props.scene.add(lightA);
		Props.scene.add(lightB);
	}
}

export { SceneUtils }
