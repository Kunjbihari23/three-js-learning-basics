/* eslint-disable no-unused-vars */
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function FirstComponent() {
  const container = useRef();
  useEffect(() => {
    /* ----------- basic scene , camera , renderer with orbit control ------------*/
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      50
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.current && container.current.appendChild(renderer.domElement);

    const orbitsControl = new OrbitControls(camera, container.current);
    orbitsControl.enableZoom = true;
    orbitsControl.zoomSpeed = 1;

    // stops panning of the right click control
    // orbitsControl.enablePan = false;

    orbitsControl.autoRotate = false;
    orbitsControl.autoRotateSpeed = 4;
    orbitsControl.minPolarAngle = 0; // radians
    orbitsControl.maxPolarAngle = Math.PI; // radians

    // smooth controls when user rotate by mouse and the object stops rotating immediately
    orbitsControl.enableDamping = true;

    // set the damping factor (how quickly the rotation slows down) more means very quick
    orbitsControl.dampingFactor = 0.03;

    /* ---------------  Geomertries ----------------- */

    // Box
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

    // Sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 10, 30, 2, Math.PI);

    // Plane
    const planeGeometry = new THREE.PlaneGeometry(2, 2);

    // torus (donut shape)
    const torusGeometry = new THREE.TorusGeometry(0.4, 0.2, 20, 20);

    // cylinder
    const cylinderGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 20);

    // cone
    const ConeGeometry = new THREE.ConeGeometry(0.8, 1, 10);

    // BufferGeometry manually
    const BufferGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -1.0,
      -1.0,
      1.0, // v0
      1.0,
      -1.0,
      1.0, // v1
      1.0,
      1.0,
      1.0, // v2
    ]);
    // itemSize = 3 because there are 3 values (components) per vertex
    BufferGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(vertices, 3)
    );
    BufferGeometry.setIndex([0, 1, 2]);

    // Compute normals for proper shading
    BufferGeometry.computeVertexNormals();

    /* ---------------  Mesh Material ----------------- */
    const material = new THREE.MeshStandardMaterial({
      color: "#A2F199",
      // wireframe: true,
      metalness: 0.7,
      roughness: 0.2,
      side: THREE.DoubleSide,
    });

    const material1 = new THREE.MeshDepthMaterial({
      side: THREE.DoubleSide,
    });

    const material2 = new THREE.MeshNormalMaterial({
      side: THREE.DoubleSide,
    });

    const material3 = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      color: "#A2F199",
    });

    /* ---------------  Light ----------------- */
    const light = new THREE.DirectionalLight(0xffffff, 2); // soft white light
    light.position.set(5, 5, 5);
    const helperLight = new THREE.DirectionalLightHelper(light, 1);
    scene.add(light);
    scene.add(helperLight);

    /* ---------------  Mesh Objects ----------------- */
    const PlaneObject = new THREE.Mesh(planeGeometry, material);
    const cubeObject = new THREE.Mesh(cubeGeometry, material);
    const sphereObject = new THREE.Mesh(sphereGeometry, material);
    const donutObject = new THREE.Mesh(torusGeometry, material);
    const cylinderObject = new THREE.Mesh(cylinderGeometry, material);
    const coneObject = new THREE.Mesh(ConeGeometry, material);
    const BufferObject = new THREE.Mesh(BufferGeometry, material);
    scene.add(PlaneObject);
    scene.add(cubeObject);
    scene.add(sphereObject);
    scene.add(donutObject);
    scene.add(cylinderObject);
    scene.add(coneObject);
    // scene.add(BufferObject);

    // BufferObject.position.set(0, -2, 0);
    // BufferObject.rotation.x = Math.PI / 3;
    // BufferObject.rotation.y = Math.PI / 4;

    PlaneObject.position.x = -2;
    cubeObject.position.x = 0;
    sphereObject.position.x = 2;
    donutObject.position.x = 4;
    cylinderObject.position.x = -4;
    // coneObject.position.x = -2;
    coneObject.position.y = 2;
    // BufferObject.position.y = -2;

    /* ---------------  Helpers ----------------- */

    const gridHelper = new THREE.GridHelper(30, 20);
    // const axisHelper = new THREE.AxesHelper(5);

    // Box Helper show box around the object
    // const boxHelper = new THREE.BoxHelper(cubeObject, 0xffff00);

    // draw plane in 3d space
    // const plane = new THREE.Plane(new THREE.Vector3(0, 0.5, 0), 1);

    // Plane Helper show plane in 3d space
    // const helperPlane = new THREE.PlaneHelper(plane, 2, 0xffff00);

    // Polar Grid Helper show 2d line in polar coordinate
    // const polarHelper = new THREE.PolarGridHelper(1, 5, 5, 5);

    // Camera Helper DRW line of camera frustum
    // const cameraHelper = new THREE.CameraHelper(camera);
    // polarHelper.position.set(-2, -1, 0);

    camera.position.z = 5;

    scene.add(gridHelper);
    // scene.add(axisHelper);
    // scene.add(boxHelper);
    // scene.add(helperPlane);
    // scene.add(polarHelper);
    // scene.add(cameraHelper);

    const clock = new THREE.Clock();

    let animationId;

    /* ---------------  Animation Loop ----------------- */
    const animate = function () {
      animationId = requestAnimationFrame(animate);

      // const elapsedTime = clock.getElapsedTime();
      // boxHelper.update();
      // cube.rotation.x = elapsedTime + 0.1;
      // cube.rotation.y = elapsedTime + 0.1;

      orbitsControl.update();
      renderer.render(scene, camera);
    };

    animate();

    // responsive canvas
    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <div ref={container} />;
}

export default FirstComponent;
