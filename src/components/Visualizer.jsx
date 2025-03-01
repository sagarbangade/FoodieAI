import { useEffect, useRef } from "react";

const Visualizer = ({ audioBlob }) => {
  const visualizerRef = useRef(null);
  const audioRef = useRef(null);
  const sceneRef = useRef(null);

  // Effect for initial script loading
  useEffect(() => {
    const loadScripts = async () => {
      // Load Three.js
      const script1 = document.createElement("script");
      script1.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/102/three.js";
      document.body.appendChild(script1);
      
      // Load SimplexNoise
      const script2 = document.createElement("script");
      script2.src = "https://cdnjs.cloudflare.com/ajax/libs/simplex-noise/2.3.0/simplex-noise.min.js";
      document.body.appendChild(script2);
      
      // Wait for both scripts to load
      await new Promise(resolve => {
        script2.onload = resolve;
      });
      
      // Now scripts are loaded, we can reference them
      audioRef.current = new Audio();
    };
    
    loadScripts();
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      clearScene();
    };
  }, []);
  
  // Effect for handling audioBlob changes
  useEffect(() => {
    if (!audioBlob || !audioRef.current) return;
    
    const audioURL = URL.createObjectURL(audioBlob);
    audioRef.current.src = audioURL;
    
    clearScene();
    startVis();
    
    audioRef.current.play();
    audioRef.current.onended = () => URL.revokeObjectURL(audioURL);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [audioBlob]);
  
  const clearScene = () => {
    if (!visualizerRef.current) return;
    
    const canvas = visualizerRef.current.querySelector('canvas');
    if (canvas) {
      visualizerRef.current.removeChild(canvas);
    }
    
    if (sceneRef.current) {
      // Clean up Three.js resources
      sceneRef.current = null;
    }
  };
  
  const startVis = () => {
    if (!audioRef.current || !visualizerRef.current) return;
    
    const noise = new SimplexNoise();
    const audio = audioRef.current;
    
    const context = new AudioContext();
    const src = context.createMediaElementSource(audio);
    const analyser = context.createAnalyser();
    src.connect(analyser);
    analyser.connect(context.destination);
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
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
      color: "#a7acaf",
      wireframe: true,
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    const light = new THREE.DirectionalLight("#f54a00", 3);
    light.position.set(0, 50, 100);
    scene.add(light);
    scene.add(sphere);
    
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    
    window.addEventListener("resize", handleResize);
    
    function render() {
      if (!analyser) return;
      
      analyser.getByteFrequencyData(dataArray);
      
      const lowerHalf = dataArray.slice(0, dataArray.length / 2 - 1);
      const upperHalf = dataArray.slice(
        dataArray.length / 2 - 1,
        dataArray.length - 1
      );
      
      const lowerMax = Math.max(...lowerHalf);
      const upperAvg =
        upperHalf.reduce((sum, b) => sum + b, 0) / upperHalf.length;
      
      const lowerMaxFr = lowerMax / lowerHalf.length;
      const upperAvgFr = upperAvg / upperHalf.length;
      
      sphere.rotation.x += 0.001;
      sphere.rotation.y += 0.003;
      sphere.rotation.z += 0.005;
      
      WarpSphere(
        sphere,
        modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8),
        modulate(upperAvgFr, 0, 1, 0, 4)
      );
      
      requestAnimationFrame(render);
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
    
    // Start animation
    render();
    
    // Return cleanup for this specific visualization
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  };
  
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black">
      <div id="visualizer" ref={visualizerRef} className="flex-1 cursor-pointer"></div>
    </div>
  );
};

export default Visualizer;