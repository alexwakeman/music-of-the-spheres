import * as THREE from 'three';
import {isEqual} from 'lodash';
import {Colours} from '../config/colours';
import {
	CONNECTING_LINE, MAIN_ARTIST_SPHERE, RELATED_ARTIST_SPHERE, Props,
	RELATED_ARTIST_TEXT, MAIN_ARTIST_TEXT, ArtistProps
} from './props';
import {Statistics} from './statistics.class';

let HELVETIKER;
const MAIN_ARTIST_FONT_SIZE = 34;
const RELATED_ARTIST_FONT_SIZE = 25;
const TOTAL_RELATED = 6;
const RELATED_POSITIONS = [
	new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
	new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
	new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1)
];

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

	static clamp(a, b, c) {
		return Math.max(b, Math.min(c, a));
	}

	static sign(n) {
		return n > 0 ? 1 : n < 0 ? -1 : 0;
	}

	static negateVector(vector) {
		return new THREE.Vector3(
			SceneUtils.negateNumber(vector.x),
			SceneUtils.negateNumber(vector.y),
			SceneUtils.negateNumber(vector.z)
		)
	}

	static negateNumber(n) {
		return n === 0 ? n : n < 0 ? Math.abs(n) : -n;
	}
	
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

	static createMainArtistSphere(mainArtist, relatedArtistExplored = null) {
		let radius = Statistics.getArtistSphereSize(mainArtist);
		let geometry = new THREE.SphereGeometry(radius, 35, 35);
		let sphere = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
			color: Colours.mainArtist,
			specular: 0x050505,
			shininess: 100
		}));
		sphere.artistObj = mainArtist;
		sphere.radius = radius;
		sphere.type = MAIN_ARTIST_SPHERE;
		sphere.colours = {};
		sphere.colours.default = Colours.mainArtist;
		sphere.colours.hover = Colours.mainArtistHover;
		sphere.colours.selected = Colours.mainArtist;
		if (relatedArtistExplored) {
			sphere.position.copy(relatedArtistExplored.position);
			sphere.exitPosition = SceneUtils.negateVector(relatedArtistExplored.userData.directionNorm);
		}
		SceneUtils.addText(mainArtist.name, MAIN_ARTIST_FONT_SIZE, sphere, MAIN_ARTIST_TEXT);
		return sphere;
	}

	static createRelatedSpheres(mainArtist, mainArtistSphere) {
		let relatedArtistsSphereArray = [];
		let relatedArtist;
		let limit = Math.min(TOTAL_RELATED, mainArtist.related.length);
		let availablePositions = SceneUtils.getAvailableRelatedPositions(mainArtistSphere);

		if (mainArtistSphere.exitPosition && limit === TOTAL_RELATED) {
			limit -= 1;
		}

		for (let i = 0; i < limit; i++) {
			relatedArtist = mainArtist.related[i];
			let direction = availablePositions[i];
			let radius = Statistics.getArtistSphereSize(relatedArtist);
			let geometry = new THREE.SphereGeometry(radius, 35, 35);
			let relatedArtistSphere = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
				color: Colours.relatedArtist,
				specular: 0x050505,
				shininess: 100
			}));
			let genreMetrics = Statistics.getSharedGenreMetric(mainArtist, relatedArtist);
			relatedArtistSphere.type = RELATED_ARTIST_SPHERE;
			relatedArtistSphere.artistObj = relatedArtist;
			relatedArtistSphere.artistObj.genreSimilarity = genreMetrics.genreSimilarity;
			relatedArtistSphere.distance = genreMetrics.lineLength;
			relatedArtistSphere.radius = radius;
			relatedArtistSphere.colours = {};
			relatedArtistSphere.colours.default = Colours.relatedArtist;
			relatedArtistSphere.colours.hover = Colours.relatedArtistHover;
			relatedArtistSphere.colours.selected = Colours.relatedArtistClicked;
			relatedArtistSphere.index = i;
			relatedArtistSphere.geometry.computeBoundingSphere();
			SceneUtils.positionRelatedArtist(mainArtistSphere, relatedArtistSphere, direction);
			SceneUtils.joinRelatedArtistSphereToMain(mainArtistSphere, relatedArtistSphere);
			SceneUtils.addText(relatedArtist.name, RELATED_ARTIST_FONT_SIZE, relatedArtistSphere, RELATED_ARTIST_TEXT);
			relatedArtistsSphereArray.push(relatedArtistSphere);
		}
		return relatedArtistsSphereArray;
	}

	static getAvailableRelatedPositions(mainArtistSphere) {
		if (mainArtistSphere.exitPosition) {
			return RELATED_POSITIONS.filter(pos => !isEqual(pos, mainArtistSphere.exitPosition));
		} else {
			return RELATED_POSITIONS;
		}
	}

	static appendObjectsToScene(sphere, sphereArray = []) {
		ArtistProps.assign(sphere, sphereArray);
	}

	static joinRelatedArtistSphereToMain(mainArtistSphere, relatedSphere) {
		let material = new THREE.LineBasicMaterial({color: Colours.relatedLineJoin});
		let geometry = new THREE.Geometry();
		let line;
		geometry.vertices.push(mainArtistSphere.position.clone());
		geometry.vertices.push(relatedSphere.target.clone());
		line = new THREE.Line(geometry, material);
		line.type = CONNECTING_LINE;
		mainArtistSphere.add(line);
	}

	static positionRelatedArtist(mainArtistSphere, relatedSphere, direction) {
		let mainArtistSpherePos = mainArtistSphere.position.clone();
		relatedSphere.target = mainArtistSpherePos.add(direction.multiplyScalar(relatedSphere.distance));
		relatedSphere.userData.directionNorm = direction;
	}

	static addText(label, size, sphere, textType) {
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
		textMesh.type = textType;
		sphere.textMesh = textMesh;
		textMesh.parentSphere = sphere;
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
