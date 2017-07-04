import {Line, LineBasicMaterial, MeshBasicMaterial, Geometry, TextGeometry, Vector3, MeshFaceMaterial} from 'three';

export default class Utils {
    /**
     *
     * @param a - min
     * @param b - max
     * @param c - value to clamp
     * @returns {number}
     */
    static clamp(a, b, c) {
       return Math.max(b,Math.min(c,a));
    }

    /**
     * Given positive x return 1, negative x return -1, or 0 otherwise
     * @param x
     * @returns {number}
     */
    static sign(x) {
        return x > 0 ? 1 : x < 0 ? -1 : 0;
    };

    static renormalizeQuarternion(object) {
        let clone = object.clone();
		let q = clone.quaternion;
		let magnitude = Math.sqrt(Math.pow(q.w, 2) + Math.pow(q.x, 2) + Math.pow(q.y, 2) + Math.pow(q.z, 2));
		q.w /= magnitude;
		q.x /= magnitude;
		q.y /= magnitude;
		q.z /= magnitude;
		return q;
    }

    static getIntersectsFromMousePos(event, sceneGraph, threeScene) {
		let intersects = [];
		if (objects) {
			let vector = new THREE.Vector3((event.clientX / window.innerWidth ) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1, 0.5);
			threeScene.projector.unprojectVector(vector, PES.View.camera);
			let raycaster = new THREE.Raycaster(PES.View.camera.position, vector.sub(PES.View.camera.position).normalize());
			intersects = raycaster.intersectObjects(sceneGraph.children, true);
		}

		return intersects;
	}

	static joinRelatedArtistSphereToMain(mainArtistSphere, relatedSphere, scenePosition) {
		let material = new LineBasicMaterial({ color: Colours.relatedlineJoin });
		let geometry = new Geometry();
		let line;
		geometry.vertices.push(scenePosition.clone());
		geometry.vertices.push(relatedSphere.position.clone());
		line = new Line(geometry, material);
		mainArtistSphere.add(line);
	}

	static positionRelatedArtist(mainArtistSphere, relatedSphere, sphereFaceIndex) {
		let mainArtistSphereFace = mainArtistSphere.geometry.faces[Math.round(sphereFaceIndex)].normal.clone();
		relatedSphere.position = mainArtistSphereFace
			.multiply(new Vector3(
				relatedSphere.distance,
				relatedSphere.distance,
				relatedSphere.distance
				)
			);
	}

	static addText(label, size, sphere) {
		let materialFront = new MeshBasicMaterial({color: PES.Colors.textOuter });
		let materialSide = new MeshBasicMaterial({color: PES.Colors.textInner });
		let materialArray = [materialFront, materialSide];
		let textGeom = new TextGeometry(label,
			{
				size: size,
				height: 4,
				curveSegments: 5,
				font: "helvetiker",
				weight: "bold",
				style: "normal",
				bevelThickness: 0.5,
				bevelSize: 1,
				bevelEnabled: true,
				material: 0,
				extrudeMaterial: 1
			});
		let textMaterial = new MeshFaceMaterial(materialArray);
		let textMesh = new Mesh(textGeom, textMaterial );
		textMesh.geometry.computeBoundingBox();
		textMesh.position.set(-size, sphere.radius * 2 + 20, 0); // underneath the sphere
		textMesh.isText = true;
		sphere.add(textMesh);
	}
}