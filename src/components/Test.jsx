import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const RubiksLoopVisualizer = () => {
  const mountRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const sceneRef = useRef(null);
  const cubesRef = useRef([]);
  const labelsRef = useRef([]);

  // Generate all 27 positions
  const positions = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        positions.push({ x, y, z });
      }
    }
  }

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#1a1a2e");
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(5, 5, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight - 100);

    const currentMount = mountRef.current;
    currentMount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Add grid helpers
    const gridHelper = new THREE.GridHelper(6, 6, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Add axis labels
    const createAxisLabel = (text, position, color) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = 128;
      canvas.height = 64;
      context.fillStyle = color;
      context.font = "bold 48px Arial";
      context.textAlign = "center";
      context.fillText(text, 64, 48);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(position);
      sprite.scale.set(1, 0.5, 1);
      return sprite;
    };

    scene.add(createAxisLabel("X", new THREE.Vector3(3, 0, 0), "#ff6b6b"));
    scene.add(createAxisLabel("Y", new THREE.Vector3(0, 3, 0), "#4ecdc4"));
    scene.add(createAxisLabel("Z", new THREE.Vector3(0, 0, 3), "#ffe66d"));

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / (window.innerHeight - 100);
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight - 100);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      currentMount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // Update cubes based on current step
  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;

    // Clear existing cubes and labels
    cubesRef.current.forEach((cube) => scene.remove(cube));
    labelsRef.current.forEach((label) => scene.remove(label));
    cubesRef.current = [];
    labelsRef.current = [];

    // Add cubes up to current step
    for (let i = 0; i <= currentStep && i < positions.length; i++) {
      const pos = positions[i];
      const isLatest = i === currentStep;

      // Create cube
      const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      const material = new THREE.MeshStandardMaterial({
        color: isLatest ? 0x00ff00 : 0x4a90e2,
        transparent: !isLatest,
        opacity: isLatest ? 1 : 0.6,
        emissive: isLatest ? 0x00ff00 : 0x000000,
        emissiveIntensity: isLatest ? 0.3 : 0,
      });

      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(pos.x * 1.5, pos.y * 1.5, pos.z * 1.5);
      scene.add(cube);
      cubesRef.current.push(cube);

      // Add label
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = 256;
      canvas.height = 128;
      context.fillStyle = isLatest ? "#00ff00" : "#ffffff";
      context.font = "bold 36px Arial";
      context.textAlign = "center";
      context.fillText(`(${pos.x}, ${pos.y}, ${pos.z})`, 128, 64);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(pos.x * 1.5, pos.y * 1.5 + 1, pos.z * 1.5);
      sprite.scale.set(2, 1, 1);
      scene.add(sprite);
      labelsRef.current.push(sprite);
    }
  }, [currentStep, positions]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= positions.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, positions.length]);

  const pos = positions[currentStep];

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      <div ref={mountRef} />

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(to top, #16213e, #0f3460)",
          padding: "20px",
          color: "white",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>
              Step {currentStep + 1} of {positions.length}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  cursor: currentStep === 0 ? "not-allowed" : "pointer",
                  background: currentStep === 0 ? "#555" : "#e94560",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  opacity: currentStep === 0 ? 0.5 : 1,
                }}
              >
                ← Previous
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  cursor: "pointer",
                  background: isPlaying ? "#ff6b6b" : "#4ecdc4",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  fontWeight: "bold",
                }}
              >
                {isPlaying ? "⏸ Pause" : "▶ Play"}
              </button>

              <button
                onClick={() =>
                  setCurrentStep(
                    Math.min(positions.length - 1, currentStep + 1)
                  )
                }
                disabled={currentStep === positions.length - 1}
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  cursor:
                    currentStep === positions.length - 1
                      ? "not-allowed"
                      : "pointer",
                  background:
                    currentStep === positions.length - 1 ? "#555" : "#e94560",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  opacity: currentStep === positions.length - 1 ? 0.5 : 1,
                }}
              >
                Next →
              </button>

              <button
                onClick={() => setCurrentStep(0)}
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  cursor: "pointer",
                  background: "#533483",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                ↺ Reset
              </button>
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              padding: "15px",
              borderRadius: "8px",
              fontSize: "18px",
            }}
          >
            <strong>Current Position:</strong>
            <span style={{ color: "#ff6b6b", fontWeight: "bold" }}>
              {" "}
              x = {pos.x}
            </span>
            ,
            <span style={{ color: "#4ecdc4", fontWeight: "bold" }}>
              {" "}
              y = {pos.y}
            </span>
            ,
            <span style={{ color: "#ffe66d", fontWeight: "bold" }}>
              {" "}
              z = {pos.z}
            </span>
            <div style={{ marginTop: "10px", fontSize: "14px", color: "#ccc" }}>
              💡 <strong>Tip:</strong> Watch how x changes fastest (inner loop),
              then y, then z (outer loop). The{" "}
              <span style={{ color: "#00ff00" }}>GREEN</span> cube is the
              current one being placed!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RubiksLoopVisualizer;
