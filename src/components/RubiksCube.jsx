import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

const colors = {
  right: 0xff0000, // red
  left: 0xff8000, // orange
  top: 0xffffff, // white
  bottom: 0xffff00, // yellow
  front: 0x00ff00, // green
  back: 0x0000ff, // blue
};

const RubiksCube = () => {
  const container = useRef();
  useEffect(() => {
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      50,
    );

    const orbitalControls = new OrbitControls(camera, container.current);
    orbitalControls.enableDamping = true;
    orbitalControls.dampingFactor = 0.05;
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.current && container.current.appendChild(renderer.domElement);

    const cubeGeometry = new THREE.BoxGeometry(0.95, 0.95, 0.95);
    const Materials = {
      red: new THREE.MeshStandardMaterial({ color: colors.right }),
      orange: new THREE.MeshStandardMaterial({ color: colors.left }),
      white: new THREE.MeshStandardMaterial({ color: colors.top }),
      yellow: new THREE.MeshStandardMaterial({ color: colors.bottom }),
      green: new THREE.MeshStandardMaterial({ color: colors.front }),
      blue: new THREE.MeshStandardMaterial({ color: colors.back }),
    };

    const CubeGroup = new THREE.Group();
    scene.add(CubeGroup);

    const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const cubeMaterials = [
            x === 1 ? Materials.red : blackMaterial,
            x === -1 ? Materials.orange : blackMaterial,
            y === 1 ? Materials.white : blackMaterial,
            y === -1 ? Materials.yellow : blackMaterial,
            z === 1 ? Materials.green : blackMaterial,
            z === -1 ? Materials.blue : blackMaterial,
          ];

          const cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
          cube.position.set(x, y, z);
          CubeGroup.add(cube);
        }
      }
    }

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(5, 5, 5);
    light.castShadow = true;
    // const helper = new THREE.DirectionalLightHelper(light, 1);
    scene.add(light);
    // scene.add(helper);

    const lightAmbient = new THREE.AmbientLight(0xffffff, 1);
    lightAmbient.position.set(1, 5, 5);
    scene.add(lightAmbient);

    //  const light = new THREE.DirectionalLight(0xffffff, 2); // soft white light
    //     light.position.set(5, 5, 5);
    //     const helperLight = new THREE.DirectionalLightHelper(light, 1);
    //     scene.add(light);
    //     scene.add(helperLight);

    camera.position.z = 5;

    const animateScene = () => {
      requestAnimationFrame(animateScene);
      orbitalControls.update();
      // CubeGroup.rotation.x += 0.01;
      // CubeGroup.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animateScene();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.max(2, window.devicePixelRatio));
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      container.current && container.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={container} />;
};

export default RubiksCube;
