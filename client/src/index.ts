import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRM, VRMSchema } from "@pixiv/three-vrm";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.01,
  1000,
);
camera.position.z = 2;

const controls = new OrbitControls(camera, canvas);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);

const ambientLight = new THREE.AmbientLight(0xaaaaaa);
scene.add(ambientLight);
const directionLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionLight.position.set(5, 10, 10);
scene.add(directionLight);

const loader = new GLTFLoader();
const gltf = await loader.loadAsync("/assets/AliciaSolid.vrm");
const vrm = await VRM.from(gltf);
scene.add(vrm.scene);

const head = vrm.humanoid!.getBoneNode(VRMSchema.HumanoidBoneName.Head)!;
camera.position.set(0, head.getWorldPosition(new THREE.Vector3()).y, -1);
camera.rotation.y = Math.PI;
head.getWorldPosition(controls.target);

const clock = new THREE.Clock();

const animate = () => {
  requestAnimationFrame(animate);
  controls.update();

  const delta = clock.getDelta();

  vrm.update(delta);

  renderer.render(scene, camera);
};
clock.start();
animate();

let isInit = false;
let offsetX = 0;
let offsetY = 0;
let offsetZ = 0;

const meme = new WebSocket("ws://localhost:5001");
meme.addEventListener("open", () => {
  console.log("JINS MEME connected");
});
meme.addEventListener("message", ({ data }) => {
  const { pitch, yaw, roll, blinkSpeed } = JSON.parse(data);

  if (!isInit) {
    offsetX = pitch;
    offsetY = yaw;
    offsetZ = roll;
    isInit = true;
  }

  const x = offsetX - pitch;
  const y = offsetY - yaw;
  const z = roll - offsetZ;

  head.rotation.x = THREE.MathUtils.degToRad(x);
  head.rotation.y = THREE.MathUtils.degToRad(y);
  head.rotation.z = THREE.MathUtils.degToRad(z);
  vrm.blendShapeProxy?.setValue(
    VRMSchema.BlendShapePresetName.Blink,
    blinkSpeed,
  );
});
