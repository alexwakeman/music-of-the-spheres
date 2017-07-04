import * as THREE from "three";
import {Colours} from '../config/colours';
let HELVETIKER;

class SceneUtils {
	static init() {
		const loader = new THREE.FontLoader();
		loader.load('./js/fonts/helvetiker_regular.typeface.json', (font) => HELVETIKER = font);
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
	 * @param x
	 * @returns {number}
	 */
	static sign(x) {
		return x > 0 ? 1 : x < 0 ? -1 : 0;
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

	static getIntersectsFromMousePos(event, graph, raycaster, mouseVector, camera, renderer) {
		mouseVector.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
		mouseVector.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1;
		raycaster.setFromCamera(mouseVector, camera);
		return raycaster.intersectObjects(graph.children, true);
	}

	static createMainArtistSphere(artist) {
		let radius = artist.popularity * 10;
		let size = radius * 2;
		let geometry = new THREE.SphereGeometry(40, 35, 35);
		let sphere = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: Colours.mainArtist}));
		sphere.artistObj = artist;
		sphere.radius = radius;
		sphere.isMainArtistSphere = true;
		sphere.isSphere = true;
		this.addText(artist.name, 34, sphere);
		return sphere;
	}

	// TODO: get stats for relatedness (genres union measure) - distance from main artist
	// TODO: clean up this code, remove the hard coded numbers
	static createRelatedSpheres(artist, mainArtistSphere) {
		let relatedArtistsSphereArray = [];
		let relatedArtistObj;
		let sphereFaceIndex = 0; // references a well spaced face of the main artist sphere
		let facesCount = mainArtistSphere.geometry.faces.length - 1;
		let step = facesCount / artist.related.length;

		for (let i = 0, len = artist.related.length; i < len; i++) {
			relatedArtistObj = artist.related[i];
			let radius = relatedArtistObj.followers; // size of this sphere
			let size = radius * 2;
			let geometry = new THREE.SphereGeometry(40, 35, 35);
			let relatedArtistSphere = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: Colours.relatedArtist}));
			relatedArtistObj.unitLength = 100;
			relatedArtistObj.range = 50;
			relatedArtistSphere.artistObj = relatedArtistObj;
			relatedArtistSphere.radius = radius;
			relatedArtistSphere.isRelatedArtistSphere = true;
			relatedArtistSphere.isSphere = true;
			relatedArtistSphere.yearsShared = relatedArtistObj.yearsShared;
			relatedArtistSphere.distance = 900; // will be union statistic
			sphereFaceIndex += step;
			SceneUtils.positionRelatedArtist(mainArtistSphere, relatedArtistSphere, sphereFaceIndex);
			SceneUtils.joinRelatedArtistSphereToMain(mainArtistSphere, relatedArtistSphere);
			SceneUtils.addText(relatedArtistObj.name, 20, relatedArtistSphere);
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
		geometry.vertices.push(new THREE.Vector3(0, 1, 0));
		geometry.vertices.push(relatedSphere.position.clone());
		line = new THREE.Line(geometry, material);
		mainArtistSphere.add(line);
	}

	static positionRelatedArtist(mainArtistSphere, relatedSphere, sphereFaceIndex) {
		let mainArtistSphereFace = mainArtistSphere.geometry.faces[Math.round(sphereFaceIndex)].normal.clone();
		relatedSphere.position
			.set(mainArtistSphereFace.multiply(new THREE.Vector3(
					relatedSphere.distance,
					relatedSphere.distance,
					relatedSphere.distance
				)
			)
		);
	}

	static addText(label, size, sphere) {
		let textMesh;
		let materialFront = new THREE.MeshBasicMaterial({color: Colours.textOuter});
		let materialSide = new THREE.MeshBasicMaterial({color: Colours.textInner});
		let materialArray = [materialFront, materialSide];
		let textGeom = new THREE.TextGeometry(label, {
			font: HELVETIKER,
			size: 80,
			height: 5,
			curveSegments: 12,
			bevelEnabled: true,
			bevelThickness: 10,
			bevelSize: 8,
			bevelSegments: 5
		});
		textGeom.computeBoundingBox();
		textGeom.computeVertexNormals();
		textMesh = new THREE.Mesh(textGeom, materialArray);
		textMesh.position.set(-size, sphere.radius * 2 + 20, 0); // underneath the sphere
		textMesh.isText = true;
		sphere.add(textMesh);
	}

	static lighting(scene) {
		let dirLight = new THREE.DirectionalLight(0xffffff, 0.125);
		dirLight.position.set(0, 0, 1).normalize();
		scene.add( dirLight );
		let pointLight = new THREE.PointLight(0xffffff, 1.5);
		pointLight.position.set(0, 100, 90);
		pointLight.color.setHex(Colours.textOuter);
		scene.add(pointLight);
	}
}

export { SceneUtils }
