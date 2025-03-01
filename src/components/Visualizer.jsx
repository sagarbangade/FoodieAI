import { useEffect } from "react";

const Visualizer = () => {
  useEffect(() => {
    const script1 = document.createElement("script");
    script1.src =
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/102/three.js";
    script1.async = true;
    document.body.appendChild(script1);

    const script2 = document.createElement("script");
    script2.src =
      "https://cdnjs.cloudflare.com/ajax/libs/simplex-noise/2.3.0/simplex-noise.min.js";
    script2.async = true;
    document.body.appendChild(script2);

    script2.onload = () => {
      initVisualizer();
    };

    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, []);

  const initVisualizer = () => {
    let noise = new SimplexNoise();
    const area = document.getElementById("visualizer");
    const label = document.getElementById("label");
    const audioInput = document.getElementById("audio");

    let audio = new Audio("");

    audioInput.addEventListener("change", function () {
      audio.pause();
      const audioFile = this.files[0];
      if (audioFile && audioFile.name.includes(".mp3")) {
        const audioURL = URL.createObjectURL(audioFile);
        audio = new Audio(audioURL);
        clearScene();
        startVis(audio);
      } else {
        alert("Please upload an mp3 file");
      }
    });

    area.addEventListener("click", () => {
      if (audio.paused) {
        audio.play();
        label.style.display = "none";
      } else {
        audio.pause();
        label.style.display = "flex";
      }
    });

    function clearScene() {
      const canvas = area.firstElementChild;
      if (canvas) area.removeChild(canvas);
    }

    function startVis(audio) {
      const context = new AudioContext();
      const src = context.createMediaElementSource(audio);
      const analyser = context.createAnalyser();
      src.connect(analyser);
      analyser.connect(context.destination);
      analyser.fftSize = 512;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const scene = new THREE.Scene();
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

      area.appendChild(renderer.domElement);
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

      window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      });

      function render() {
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
        mesh.geometry.vertices.forEach(function (vertex) {
          var offset = mesh.geometry.parameters.radius;
          var amp = 5;
          var time = window.performance.now();
          vertex.normalize();
          var rf = 0.00001;
          var distance =
            offset +
            bassFr +
            noise.noise3D(
              vertex.x + time * rf * 4,
              vertex.y + time * rf * 6,
              vertex.z + time * rf * 7
            ) *
              amp *
              treFr *
              2;
          vertex.multiplyScalar(distance);
        });
        mesh.geometry.verticesNeedUpdate = true;
        mesh.geometry.normalsNeedUpdate = true;
        mesh.geometry.computeVertexNormals();
        mesh.geometry.computeFaceNormals();
      }

      render();
    }

    function modulate(val, minVal, maxVal, outMin, outMax) {
      var fr = (val - minVal) / (maxVal - minVal);
      var delta = outMax - outMin;
      return outMin + fr * delta;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black">
      <div
        id="header"
        className="mt-5 mb-5 flex justify-center items-center gap-2"
      >
        <label
          htmlFor="audio"
          id="label"
          className="bg-gray-200 border border-gray-500 rounded-lg px-3 py-1 text-sm font-sans transition duration-200 hover:bg-white cursor-pointer"
        >
          Select File
        </label>
        <input type="file" id="audio" accept=".mp3" className="hidden" />
        <div className="text-white text-sm">Click the ball to play/pause</div>
      </div>
      <div id="visualizer" className="flex-1 cursor-pointer"></div>
    </div>
  );
};

export default Visualizer;
