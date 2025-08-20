/* global THREE, SimplexNoise */
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

const Visualizer = ({ audioBlob, colour, isSpeaking }) => {
  const visualizerRef = useRef(null);
  const audioRef = useRef(null);
  const sceneRef = useRef(null);
  const sphereRef = useRef(null);
  const lightRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);
  const [color, setColor] = useState("#009dff");

  useEffect(() => {
    if (colour == "Non-veg") {
      setColor("#ff0026");
    } else if (colour == "Veg") {
      setColor("#009dff");
    } else if (colour == "Vegan") {
      setColor("#00ff1e");
    }
    // Immediately update existing material/light if present
    if (sphereRef.current && sphereRef.current.material) {
      sphereRef.current.material.color = new THREE.Color(
        colour == "Non-veg"
          ? "#ff0026"
          : colour == "Veg"
          ? "#009dff"
          : "#00ff1e"
      );
      sphereRef.current.material.needsUpdate = true;
    }
    if (lightRef.current) {
      lightRef.current.color = new THREE.Color(
        colour == "Non-veg"
          ? "#ff0026"
          : colour == "Veg"
          ? "#009dff"
          : "#00ff1e"
      );
    }
  }, [colour]);
  // Effect for initial script loading
  useEffect(() => {
    const loadScripts = async () => {
      // Load Three.js
      const script1 = document.createElement("script");
      script1.src =
        "https://cdnjs.cloudflare.com/ajax/libs/three.js/102/three.js";
      document.body.appendChild(script1);

      // Load SimplexNoise
      const script2 = document.createElement("script");
      script2.src =
        "https://cdnjs.cloudflare.com/ajax/libs/simplex-noise/2.3.0/simplex-noise.min.js";
      document.body.appendChild(script2);

      // Wait for both scripts to load
      await new Promise((resolve) => {
        script2.onload = resolve;
      });
    };

    loadScripts();

    // Cleanup on unmount
    return () => {
      cleanupAudio();
      clearScene();
    };
  }, []);

  const cleanupAudio = () => {
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Disconnect and clean up audio nodes
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current
        .close()
        .catch((e) => console.log("Error closing AudioContext:", e));
      audioContextRef.current = null;
    }

    // Clean up audio element
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
  };

  // Effect for handling audioBlob changes
  useEffect(() => {
    if (audioBlob) {
      // Clean up previous audio resources
      cleanupAudio();
      clearScene();
      // Create new audio element
      audioRef.current = new Audio();
      const audioURL = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioURL;

      // Start visualization with new audio
      startVis();

      audioRef.current.play();
      audioRef.current.onended = () => {
        URL.revokeObjectURL(audioURL);
      };
    } else if (isSpeaking) {
      // While speaking via speechSynthesis, run idle visualizer
      clearScene();
      startVis();
    } else {
      // Not speaking and no audio: show a very light idle visualization
      clearScene();
      startVis();
    }

    return () => {
      cleanupAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBlob, isSpeaking]);

  const clearScene = () => {
    if (!visualizerRef.current) return;

    const canvas = visualizerRef.current.querySelector("canvas");
    if (canvas) {
      visualizerRef.current.removeChild(canvas);
    }

    if (sceneRef.current) {
      // Clean up Three.js resources
      sceneRef.current = null;
    }
    sphereRef.current = null;
    lightRef.current = null;
  };

  const startAttemptsRef = useRef(0);

  const startVis = () => {
    if (!visualizerRef.current) return;
    // Ensure external libs are loaded (THREE and SimplexNoise are loaded via script tags)
    const libsReady =
      typeof window !== "undefined" && window.THREE && window.SimplexNoise;
    if (!libsReady) {
      if (startAttemptsRef.current < 50) {
        startAttemptsRef.current += 1;
        setTimeout(startVis, 100);
      }
      return;
    }

    const noise = new SimplexNoise();
    const audio = audioRef.current;

    // Create AudioContext if not exists
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
    const context = audioContextRef.current;

    if (audio && !analyserRef.current) {
      // Create and connect audio nodes from audio element
      sourceRef.current = context.createMediaElementSource(audio);
      analyserRef.current = context.createAnalyser();
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(context.destination);
      analyserRef.current.fftSize = 512;
    } else if (!audio && !analyserRef.current) {
      // Create an analyser fed by a tiny internal oscillator for idle/speaking state
      const osc = context.createOscillator();
      const gain = context.createGain();
      const analyser = context.createAnalyser();
      osc.type = "triangle";
      osc.frequency.value = 180;
      gain.gain.value = isSpeaking ? 0.12 : 0.05;
      osc.connect(gain);
      gain.connect(analyser);
      analyser.fftSize = 512;
      osc.start();
      analyserRef.current = analyser;
      sourceRef.current = gain; // keep reference for cleanup
    }
    const bufferLength = analyserRef.current
      ? analyserRef.current.frequencyBinCount
      : 256;
    const dataArray = new Uint8Array(bufferLength);

    // Set up THREE.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 100;
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor("#000000");

    visualizerRef.current.appendChild(renderer.domElement);

    // Create geometry - v102 uses old style Geometry
    const geometry = new THREE.IcosahedronGeometry(20, 5);
    const material = new THREE.MeshLambertMaterial({
      color: color,
      wireframe: true,
    });

    const sphere = new THREE.Mesh(geometry, material);
    sphereRef.current = sphere;

    const light = new THREE.DirectionalLight(color, 3);
    light.position.set(0, 50, 100);
    lightRef.current = light;
    scene.add(light);
    scene.add(sphere);

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    // Persistent smoothing state for seamless transitions
    let smoothedLowerMaxFr = 0.2;
    let smoothedUpperAvgFr = 0.2;
    let intensityMul = 1; // will smoothly ramp between 1 (idle) and 1.2 (playing)

    function render() {
      let lowerMaxFr = 0.2;
      let upperAvgFr = 0.2;
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const lowerHalf = dataArray.slice(0, dataArray.length / 2 - 1);
        const upperHalf = dataArray.slice(
          dataArray.length / 2 - 1,
          dataArray.length - 1
        );
        const lowerMax = lowerHalf.length ? Math.max(...lowerHalf) : 0;
        const upperAvg = upperHalf.length
          ? upperHalf.reduce((sum, b) => sum + b, 0) / upperHalf.length
          : 0;
        lowerMaxFr = lowerHalf.length ? lowerMax / lowerHalf.length : 0.2;
        upperAvgFr = upperHalf.length ? upperAvg / upperHalf.length : 0.2;
      }
      // Add expressive talking modulation while TTS is speaking (no audio blob)
      if (!audioRef.current && isSpeaking) {
        const t = performance.now() * 0.002;
        lowerMaxFr += 0.15 * (0.5 + 0.5 * Math.sin(t * 2.1));
        upperAvgFr += 0.12 * (0.5 + 0.5 * Math.cos(t * 2.7));
        lowerMaxFr = Math.max(0.1, Math.min(0.9, lowerMaxFr));
        upperAvgFr = Math.max(0.1, Math.min(0.9, upperAvgFr));
      }

      // Detect if actual audio is playing
      const isAudioPlaying = !!(
        audioRef.current &&
        !audioRef.current.paused &&
        !audioRef.current.ended &&
        audioRef.current.currentTime > 0
      );

      // Smoothly ease spectrum values to avoid abrupt jumps
      const smoothing = 0.12;
      smoothedLowerMaxFr += (lowerMaxFr - smoothedLowerMaxFr) * smoothing;
      smoothedUpperAvgFr += (upperAvgFr - smoothedUpperAvgFr) * smoothing;

      // Smoothly ramp intensity when audio starts/stops for a seamless transition
      const targetIntensity = isAudioPlaying ? 1.2 : 1;
      intensityMul += (targetIntensity - intensityMul) * 0.08;

      sphere.rotation.x += 0.001 * intensityMul;
      sphere.rotation.y += 0.003 * intensityMul;
      sphere.rotation.z += 0.005 * intensityMul;

      const bassArg = modulate(Math.pow(smoothedLowerMaxFr, 0.8), 0, 1, 0, 8);
      let treArg = modulate(smoothedUpperAvgFr, 0, 1, 0, 4) * intensityMul;

      WarpSphere(sphere, bassArg, treArg);

      animationRef.current = requestAnimationFrame(render);
      renderer.render(scene, camera);
    }

    function WarpSphere(mesh, bassFr, treFr) {
      const baseRadius = 20; // Base radius
      const amp = 5;
      const time = window.performance.now();

      // THREE.js v102 uses the older Geometry with direct vertices array
      if (mesh.geometry.vertices && mesh.geometry.vertices.length > 0) {
        mesh.geometry.vertices.forEach(function (vertex) {
          // Store original normalized direction
          const originalDirection = vertex.clone().normalize();

          const rf = 0.00001;
          const noiseValue = noise.noise3D(
            originalDirection.x + time * rf * 4,
            originalDirection.y + time * rf * 6,
            originalDirection.z + time * rf * 7
          );

          const distance = baseRadius + bassFr + noiseValue * amp * treFr * 2;

          // Reset vertex to normalized direction and scale to new distance
          vertex.copy(originalDirection).multiplyScalar(distance);
        });

        // Mark vertices as needing update
        mesh.geometry.verticesNeedUpdate = true;
        mesh.geometry.normalsNeedUpdate = true;
        mesh.geometry.computeVertexNormals();
        mesh.geometry.computeFaceNormals();
      }
    }

    function modulate(val, minVal, maxVal, outMin, outMax) {
      var fr = (val - minVal) / (maxVal - minVal);
      var delta = outMax - outMin;
      return outMin + fr * delta;
    }

    // Reset attempts on successful start
    startAttemptsRef.current = 0;
    // Start animation
    render();

    // Return cleanup for this specific visualization
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black">
      <div
        id="visualizer"
        ref={visualizerRef}
        className="flex-1 cursor-pointer"
      ></div>
    </div>
  );
};

export default Visualizer;
Visualizer.propTypes = {
  audioBlob: PropTypes.any,
  colour: PropTypes.string,
  isSpeaking: PropTypes.bool,
};
