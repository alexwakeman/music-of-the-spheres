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
            }, () => {}, reject);
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
        let q = object.quaternion.clone();
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

    static createMainArtistSphere(mainArtist) {
        let radius = Statistics.getArtistSphereSize(mainArtist);
        let geometry = new THREE.SphereGeometry(radius, 35, 35);
        let sphere = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: Colours.mainArtist,
            specular: 0x050505,
            shininess: 100
        }));
        sphere.userData.artistObj = mainArtist;
        sphere.userData.radius = radius;
        sphere.userData.type = MAIN_ARTIST_SPHERE;
        sphere.userData.colours = {};
        sphere.userData.colours.default = Colours.mainArtist;
        sphere.userData.colours.hover = Colours.mainArtistHover;
        sphere.userData.colours.selected = Colours.mainArtist;
        SceneUtils.addText(mainArtist.name, MAIN_ARTIST_FONT_SIZE, sphere, MAIN_ARTIST_TEXT);
        return sphere;
    }

    static createRelatedSpheres(mainArtist, mainArtistSphere) {
        let relatedArtistsSphereArray = [];
        let relatedArtist;
        let limit = Math.min(TOTAL_RELATED, mainArtist.related.length);
        let availablePositions = RELATED_POSITIONS.map((pos) => pos.clone());

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
            relatedArtistSphere.userData.type = RELATED_ARTIST_SPHERE;
            relatedArtistSphere.userData.artistObj = relatedArtist;
            relatedArtistSphere.userData.artistObj.genreSimilarity = genreMetrics.genreSimilarity;
            relatedArtistSphere.userData.distance = genreMetrics.lineLength;
            relatedArtistSphere.userData.radius = radius;
            relatedArtistSphere.userData.colours = {};
            relatedArtistSphere.userData.colours.default = Colours.relatedArtist;
            relatedArtistSphere.userData.colours.hover = Colours.relatedArtistHover;
            relatedArtistSphere.userData.colours.selected = Colours.relatedArtistClicked;
            relatedArtistSphere.userData.index = i;
            relatedArtistSphere.geometry.computeBoundingSphere();

            // TODO fix this for explore
            SceneUtils.positionRelatedArtist(mainArtistSphere, relatedArtistSphere, direction);
            // SceneUtils.joinRelatedArtistSphereToMain(mainArtistSphere, relatedArtistSphere);
            SceneUtils.addText(relatedArtist.name, RELATED_ARTIST_FONT_SIZE, relatedArtistSphere, RELATED_ARTIST_TEXT);
            relatedArtistsSphereArray.push(relatedArtistSphere);
        }
        return relatedArtistsSphereArray;
    }

    static appendObjectsToScene(mainArtistSphere, relatedArtistsSpheres = []) {
        Props.parent = new THREE.Object3D();
        Props.graphContainer = new THREE.Object3D();
        Props.textContainer = new THREE.Object3D();
        Props.parent.add(Props.graphContainer);
        Props.parent.add(Props.textContainer);
        Props.scene.add(Props.parent);
        Props.graphContainer.add(mainArtistSphere);
        Props.graphContainer.userData = mainArtistSphere.userData.artistObj;
        Props.textContainer.add(mainArtistSphere.userData.textMesh);
        relatedArtistsSpheres.forEach(related => {
            Props.graphContainer.add(related);
            Props.textContainer.add(related.userData.textMesh);
        });
        Props.parent.add(Props.graphContainer);
        Props.parent.add(Props.textContainer);
        Props.parent.userData.graphContainer = Props.graphContainer;
    }

    static joinRelatedArtistSphereToMain(mainArtistSphere, relatedSphere) {
        let material = new THREE.LineBasicMaterial({color: Colours.relatedLineJoin});
        let geometry = new THREE.Geometry();
        let line;
        geometry.vertices.push(mainArtistSphere.position.clone().normalize());
        geometry.vertices.push(relatedSphere.userData.target.clone().normalize().multiplyScalar(relatedSphere.userData.distance));
        line = new THREE.Line(geometry, material);
        line.userData.type = CONNECTING_LINE;
        mainArtistSphere.add(line);
    }

    static positionRelatedArtist(mainArtistSphere, relatedSphere, direction) {
        let mainArtistSpherePos = mainArtistSphere.position.clone();
        relatedSphere.userData.target = mainArtistSpherePos.add(direction.multiplyScalar(relatedSphere.userData.distance));
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
        textMesh.userData.type = textType;
        sphere.userData.textMesh = textMesh;
        textMesh.userData.parentSphere = sphere;
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

export {SceneUtils}
