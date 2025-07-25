
    // M01 KHAI BÁO BIẾN | Loading

    // Add this at the top of your script, preferably after your other global variable declarations
let isRenderingEnabled = false; // Set to 'false' to disable rendering initially


      /* --------------- Divider M --------------- */
      // Khai báo tổng số model
      let totalModels = 6;

      /* --------------- Divider M --------------- */
      // Khai báo số model đã load -> bắt đầu từ 0
      let modelsLoaded = 0;

      const progressList = [0, 0, 0, 0, 0, 0]; // Mỗi model sẽ chứa 1 progress ratio [0..1]

    // ==================== Global Variables ====================
    let scene, camera, renderer, mainMixer, mainMixerScene6;
    let hdrScene1, hdrScene2, hdrScene3, hdrScene4, hdrScene5, hdrScene6;
    let scrollPosition = 0, targetScrollPosition = 0;

    // Biến cờ để biết user đã scroll lần đầu chưa
    let hasScrolledOnce = false;

    // Lưu kích thước scale hiện tại của logo
    let currentScale = 1.0;

    
    const FPS = 24, framesPerScroll = 3, easeFactor = 0.03;
    // Frame ranges where scenes switch
    const frameSwitch1 = 387;    // Scene1 -> Scene2
    const frameSwitch805 = 805;  // Scene2 Fog Change
    const frameSwitch2 = 880;    // Scene2 -> Scene3
    const frameSwitch4 = 1268;   // Scene3 -> Scene4
    const frameSwitch5 = 1693;   // Scene4 -> Scene5
    const frameSwitch6 = 2200;   // Scene5 -> Scene6 
    const maxScrollFrames = 2600;

    // ==================== Reset Trigger Flag ====================
    let resetTriggered = false; // Flag to ensure reset happens only once per cycle

    // ==================== Fog Parameters ====================
    const fogParams = {
      scene1: {color: 0xecd6bc, near: 0.1, far: 80},
      scene2_part1: {color: 0x123456, near: 1, far: 150},
      scene2_part2: {color: 0x1c4c70, near: 10, far: 40},
      scene3: {color: 0xd554e1, near: 5, far: 500},
      scene4: {color: 0xa8b771, near: 20, far: 200},
      scene5: {color: 0x4a5437, near: 100, far: 400},
      scene6: {color: 0xabcdef, near: 30, far: 300} 
    };

    // ==================== Lights ====================
    // Scene 1 Lights
    let scene1DirectionalLight, scene1AmbientLight;

    // Scene 2 Lights
    let scene2DirectionalLight, scene2AmbientLight, scene2Light;

    // Scene 3 Lights
    let scene3DirectionalLight, scene3AmbientLight;

    // Scene 4 Lights
    let scene4DirectionalLight, scene4AmbientLight;

    // Scene 5 Lights
    let scene5DirectionalLight, scene5AmbientLight;

    // === Scene 6 Lights ===
    let scene6DirectionalLight, scene6AmbientLight;

    // ==================== Animation Mixers ====================
    const clock = new THREE.Clock();

    // Independent Animations for Scene 1
    const independentAnimationsScene1 = [
      "S1-Co1.001",
      "S1-Co2.001",
      "S1-Co3.001",
      "S1-Co4.001",
      "S1-grassbush",
      "S1-RICEFIELD1.001",
      "S1-RICEFIELD2.001",
      "water1",
      "S1-Co5-Key",
      "S1-Co6-Key",
      "S1-Co7-Key",
      "S1-Co8-Key",
      "S1-Co9-Key",
      "S1-Co10-Key" 
    ];
    const independentMixersScene1 = {};

    // Independent Animations for Scene 2
    const independentAnimationsScene2 = [
      "water2",
      "peachtree01",
      "willowtree2",
      "willowtree1",
      "hill1",
      "hill2.001",
      "hill3.001",
      "hill4.001",
      "underwaterseaweed"
    ];
    const independentMixersScene2 = {};

    // Independent Animations for Scene 3
    const independentAnimationsScene3 = [
      "water3",
      "S3-BOAT",
      "S3-ISLAND1",
      "S3-ISLAND2",
      "S3-ISLAND3",
      "S3-ISLAND4",
      "S3-ISLAND1B"
    ];
    const independentMixersScene3 = {};

    // Independent Animations for Scene 4
    const independentAnimationsScene4 = [
      "Bambooleaves1",
      "Bambooleaves2"
    ];
    const independentMixersScene4 = {};

    // Independent Animations for Scene 5
    const independentAnimationsScene5 = [
      "Backgroundtrees.001",
      "DamsenAction",
      "DamsenKey", 
      "Water5"
    ];
    const independentMixersScene5 = {};

    // === Independent Animations for Scene 6 ===
    const independentAnimationsScene6 = [
      "S6-tree",
      "S6-Bird1.01",
      "S6-Bird2.01",
      "S6-Bird3.01",
      "S6-Bird4.01",
      "S6-Boat.001",
      "water6"
    ];
    const independentMixersScene6 = {};

     ///////// load percent ///////
    function loadModelWithProgress(index, url, onLoad, onError) {
        const loader = new THREE.GLTFLoader();

        loader.load(
          url,
          (gltf) => {
            // Khi model load xong:
            onLoad(gltf);

            // Đánh dấu model này 100%
            progressList[index] = 1;

            // Tăng biến đếm modelsLoaded
            modelsLoaded++;

            // Nếu tất cả 4 model đã load xong => ẩn loading, hiện audioInstruction
            if (modelsLoaded === totalModels) {
              performPageTransition01To02();
            }
          },
          (xhr) => {
            // onProgress: cập nhật ratio model này
            if (xhr.lengthComputable) {
              const ratio = xhr.loaded / xhr.total;
              progressList[index] = ratio;
            } else {
              // Trường hợp lengthComputable = false, ta có thể bỏ qua hoặc ước lượng
              // Ở đây bỏ qua => progressList[index] không cập nhật
            }

            // Tính tổng ratio
            const sumRatio = progressList.reduce((a, b) => a + b, 0);
            // Tỷ lệ loading chung: average (sumRatio / 4)
            let percent = Math.floor((sumRatio / totalModels) * 100);

            // Cập nhật hiển thị
            document.getElementById("loading-text").textContent = `${percent}%`;
          },
          (error) => {
            console.error("Error loading model:", error);
            if (onError) onError(error);
          }
        );
      }

      //-- performTransition

      function performPageTransition01To02() {
        const lotusSvgs = document.querySelectorAll(".lotus-wrapper svg"); //Gọi tên 01
        const loadingScreen = document.getElementById("loading-screen"); //Gọi tên 02
        const audioinstructionScreen = document.getElementById(
          "audio-instruction-screen"
        ); //Gọi tên 03
        const canvas3d = document.querySelector("canvas"); //Gọi tên 04

        //Gán styling 01
        lotusSvgs.forEach((svg) => {
          svg.classList.remove("animate-in");
          svg.classList.add("animate-out");
        });

        //Gán styling 02
        loadingScreen.style.opacity = "0";
        loadingScreen.style.visibility = "hidden";

        //Gán styling 03
        setTimeout(() => {
          audioinstructionScreen.classList.add("show");
        }, 500); // Delay 500ms để đảm bảo loadingScreen đã bị ẩn\

        //Gán styling 04
        canvas3d.style.display = "none";
      }

     // Nút Enter Experience
      // Nút Enter Experience
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("enterExperience")
    .addEventListener("click", () => {
      // Fade out audioInstruction
      const audioinstructionScreen = document.getElementById(
        "audio-instruction-screen"
      );
      audioinstructionScreen.classList.add("hide");

      // Hiện canvas 3D
      const canvas3d = document.querySelector("canvas");
      if (canvas3d) {
        canvas3d.style.display = "block";
      }

      // Initialize and start audio playback
      initializeAudioPlayback();
    });
});



    // ==================== Audio Variables ====================
    let scene1Audio; // Audio object for Scene 1
    let scene2Audio; // Audio object for Scene 2
    let scene3Audio; // Audio object for Scene 3
    let scene4Audio; // Audio object for Scene 4
    let scene5Audio; // Audio object for Scene 5
    let scene6Audio; // Audio object for Scene 6

    let isMuted = false; // Mute state
    let audioInitialized = false; // Flag to track if audio has been initialized

    // Flags to track audio playback
    let hasPlayedAudio1 = false;
    let hasPlayedAudio2 = false;
    let hasPlayedAudio3 = false;
    let hasPlayedAudio4 = false;
    let hasPlayedAudio5 = false;
    let hasPlayedAudio6 = false;

    // ==================== Initialization ====================
    function init() {
      // Initialize Scene and Renderer
      initSceneAndRenderer();

      // Initialize Camera
      initCamera();

      // Initialize Fog (Scene 1 by default)
      scene.fog = new THREE.Fog(
        fogParams.scene1.color,
        fogParams.scene1.near,
        fogParams.scene1.far
      );

      // Initialize Lights
      initScene1Lights();
      initScene2Lights();
      initScene3Lights();
      initScene4Lights();
      initScene5Lights(); // Existing
      initScene6Lights(); // === Scene 6 ===

      // Load HDRIs
      loadHDRIs();

      // Load Models
      loadModels();

      // Setup Event Listeners
      setupEventListeners();

      // Setup Button Controls
      setupButtonControls();

      // Initialize Audio
      initAudio();

      // Update Play Audio button text based on initial isMuted state
      updatePlayAudioButton();

      const playAudioBtn = document.getElementById('playAudioButton');
  if (playAudioBtn) {
    playAudioBtn.disabled = true;
    playAudioBtn.style.opacity = 0.5; // Optional: Visual indication of disabled state
    playAudioBtn.title = "Press 'Enter Experience' to start audio";
  }

    }

    // -------------------- Initialize Scene and Renderer --------------------
    function initSceneAndRenderer() {
      scene = new THREE.Scene();

      renderer = new THREE.WebGLRenderer({ antialias: true, precision: 'highp' });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.setClearColor(fogParams.scene1.color); 
      document.body.appendChild(renderer.domElement);
    }

    // -------------------- Initialize Camera --------------------
    function initCamera() {
      camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, // Increase near clipping plane
        1000  // Reduce far clipping plane
      );
      camera.position.set(0, 5, 10);
      scene.add(camera);
    }

    // -------------------- Initialize Controls --------------------
    function initControls() {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
    }

    // -------------------- Initialize Scene 1 Lights --------------------
    function initScene1Lights() {
      scene1DirectionalLight = new THREE.DirectionalLight(0xd25919, 0.5);
      scene1DirectionalLight.position.set(12, 8, 12);
      scene.add(scene1DirectionalLight);

      scene1AmbientLight = new THREE.AmbientLight(0xbc7e3a, 0.5);
      scene.add(scene1AmbientLight);
    }

    // -------------------- Initialize Scene 2 Lights --------------------
    function initScene2Lights() {
      scene2DirectionalLight = new THREE.DirectionalLight(0x3c49aa, 1.0);
      scene2DirectionalLight.position.set(-12, 10, -10);
      scene2DirectionalLight.visible = false;
      scene.add(scene2DirectionalLight);

      scene2AmbientLight = new THREE.AmbientLight(0x3c49aa, 2);
      scene2AmbientLight.visible = false;
      scene.add(scene2AmbientLight);

      scene2Light = new THREE.PointLight(0xED719E, 1, 0, 2.02);
      scene2Light.position.set(-11.153, 5.112, 41.631);
      scene2Light.visible = false;
      scene.add(scene2Light);
    }

    // -------------------- Initialize Scene 3 Lights --------------------
    function initScene3Lights() {
      scene3DirectionalLight = new THREE.DirectionalLight(0x7168ee, 1.0);
      scene3DirectionalLight.position.set(0, 10, 10);
      scene3DirectionalLight.visible = false;
      scene.add(scene3DirectionalLight);

      scene3AmbientLight = new THREE.AmbientLight(0x7168ee, 1.0);
      scene3AmbientLight.visible = false;
      scene.add(scene3AmbientLight);
    }

    // -------------------- Initialize Scene 4 Lights --------------------
    function initScene4Lights() {
      scene4DirectionalLight = new THREE.DirectionalLight(0xf2a41c, 1.0);
      scene4DirectionalLight.position.set(10, 15, 10);
      scene4DirectionalLight.visible = false;
      scene.add(scene4DirectionalLight);

      scene4AmbientLight = new THREE.AmbientLight(0x677739, 1.0);
      scene4AmbientLight.visible = false;
      scene.add(scene4AmbientLight);
    }

    // -------------------- Initialize Scene 5 Lights --------------------
    function initScene5Lights() {
      // Example color: white, intensity: 1
      scene5DirectionalLight = new THREE.DirectionalLight(0xeaf4d7, 3.0);
      scene5DirectionalLight.position.set(0, 10, 0);
      scene5DirectionalLight.visible = false;
      scene.add(scene5DirectionalLight);

      scene5AmbientLight = new THREE.AmbientLight(0xf4efd7, 1.0);
      scene5AmbientLight.visible = false;
      scene.add(scene5AmbientLight);
    }

    // === Initialize Scene 6 Lights ===
    function initScene6Lights() {
      scene6DirectionalLight = new THREE.DirectionalLight(0xabcdef, 1.5); // Replace with desired color and intensity
      scene6DirectionalLight.position.set(5, 15, 5); // Set appropriate position
      scene6DirectionalLight.visible = false;
      scene.add(scene6DirectionalLight);

      scene6AmbientLight = new THREE.AmbientLight(0xabcdef, 1.0); // Replace with desired color and intensity
      scene6AmbientLight.visible = false;
      scene.add(scene6AmbientLight);
    }

    // ==================== Load HDRIs ====================
    function loadHDRIs() {
      const rgbeLoader = new THREE.RGBELoader();
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();

      // Scene1 HDRI
      rgbeLoader.load('autumn_forest_2.hdr', (hdrEquirectangular) => {
        const hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(hdrEquirectangular);
        hdrScene1 = hdrCubeRenderTarget.texture;
        // Set as scene background / environment by default
        scene.background = hdrScene1; 
        scene.environment = hdrScene1; 
        hdrEquirectangular.dispose();
      });

      // Scene2 HDRI
      rgbeLoader.load('pink_sunrise_new.hdr', (hdrEquirectangular) => {
        const hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(hdrEquirectangular);
        hdrScene2 = hdrCubeRenderTarget.texture;
        hdrEquirectangular.dispose();
      });

      // Scene3 HDRI
      rgbeLoader.load('satara_night_no_lamps_1k.hdr', (hdrEquirectangular) => {
        const hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(hdrEquirectangular);
        hdrScene3 = hdrCubeRenderTarget.texture;
        hdrEquirectangular.dispose();
      });

      // Scene4 HDRI
      rgbeLoader.load('dry_orchard_meadow.hdr', (hdrEquirectangular) => {
        const hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(hdrEquirectangular);
        hdrScene4 = hdrCubeRenderTarget.texture;
        hdrEquirectangular.dispose();
      });

      // Scene5 HDRI
      rgbeLoader.load('sky_fire_1k.hdr', (hdrEquirectangular) => {
        const hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(hdrEquirectangular);
        hdrScene5 = hdrCubeRenderTarget.texture;
        hdrEquirectangular.dispose();
      });

      // === Scene6 HDRI ===
      rgbeLoader.load('spruit_sunrise_1k.hdr', (hdrEquirectangular) => { // Replace with your Scene6 HDRI file
        const hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(hdrEquirectangular);
        hdrScene6 = hdrCubeRenderTarget.texture;
        hdrEquirectangular.dispose();
      });
    }

    // -------------------- Initialize Audio --------------------
    function initAudio() {
      scene1Audio = new Audio('Cò Lả.mp3'); 
      scene1Audio.loop = true; 
      scene1Audio.volume = 0; 
      scene1Audio.preload = 'auto';

      scene2Audio = new Audio('Đào Liễu.mp3'); 
      scene2Audio.loop = true; 
      scene2Audio.volume = 0;
      scene2Audio.preload = 'auto';

      scene3Audio = new Audio('Lý Mười Thương.mp3'); 
      scene3Audio.loop = true; 
      scene3Audio.volume = 0; 
      scene3Audio.preload = 'auto';

      // Scene 4 Audio
      scene4Audio = new Audio('Hò Giã Gạo.mp3'); 
      scene4Audio.loop = true;
      scene4Audio.volume = 0; 
      scene4Audio.preload = 'auto';
      
      // Scene 5 Audio
      scene5Audio = new Audio('Dạ cổ hoài lang.mp3'); 
      scene5Audio.loop = true; 
      scene5Audio.volume = 0; 
      scene5Audio.preload = 'auto';
       
      // Scene 6 Audio
      scene6Audio = new Audio('Lý Chim Quyên.mp3'); 
      scene6Audio.loop = true; 
      scene6Audio.volume = 0; 
      scene6Audio.preload = 'auto';
    }

    // ==================== Load Models ====================
    function loadModels() {
        // Load SCENE1-NXNB.glb
        loadModelWithProgress(
          0,
          "SCENE1-NXNB.glb",
          (gltf) => {
            window.model1 = gltf.scene;
            scene.add(window.model1);

            // Traverse through loaded scene elements
            window.model1.traverse((node) => {
              if (node.isMesh && node.material) {
                // Customize materials as needed
                if (node.material.name === "Material") {
                  node.material.color.setHex(0x07142b);
                  node.material.metalness = 0.5;
                  node.material.roughness = 0.1;
                }

                if (node.material.name === "Material.004") {
                  node.material.emissive = new THREE.Color(0x4b2a07);
                  node.material.emissiveIntensity = 20;
                }
              }

              if (node.isCamera) {
                camera = node;
              }
            });

        // Main mixer for scroll-dependent animations
        mainMixer = new THREE.AnimationMixer(window.model1); 

        // Sort out animations
        gltf.animations.forEach((clip) => {
          if (independentAnimationsScene1.includes(clip.name)) {
            const mixer = new THREE.AnimationMixer(window.model1);
            const action = mixer.clipAction(clip);
            action.loop = THREE.LoopRepeat;
            action.play();
            independentMixersScene1[clip.name] = mixer;
          } else {
            const mainAction = mainMixer.clipAction(clip);
            mainAction.play();
            // Do not set loop for main animations
          }
        });
      }, undefined, (error) => {
        console.error('Error loading SCENE1-NXNB.glb:', error);
      });

      // ========== SCENE 2 ==========
      loadModelWithProgress(
        1,
        "SCENE2-NXNB.glb",
        (gltf) => {
          window.model2 = gltf.scene;
          window.model2.visible = false; // Initially hidden
          scene.add(window.model2);

          // Traverse through loaded scene elements
          window.model2.traverse((node) => {
            if (node.isMesh && node.material) {
              // Customize materials as needed
              if (node.material.name === "Material") {
                node.material.color.setHex(0x07142b);
                node.material.metalness = 0.5;
                node.material.roughness = 0.1;
              }

              if (node.material.name === "Material.004") {
                node.material.emissive = new THREE.Color(0x4b2a07);
                node.material.emissiveIntensity = 20;
              }
            }

            if (node.isCamera) {
              camera = node;
            }
          });

        gltf.animations.forEach((clip) => {
          if (independentAnimationsScene2.includes(clip.name)) {
            const mixer = new THREE.AnimationMixer(window.model2);
            const action = mixer.clipAction(clip);
            action.loop = THREE.LoopRepeat;
            action.play();
            independentMixersScene2[clip.name] = mixer;
          }
        });
      }, undefined, (error) => {
        console.error('Error loading SCENE2-NXNB.glb:', error);
      });

      // ========== SCENE 3 ==========
      loadModelWithProgress(
        2,
        "SCENE3-NXNB.glb",
        (gltf) => {
          window.model3 = gltf.scene;
          window.model3.visible = false; // Initially hidden
          scene.add(window.model3);

          // Traverse through loaded scene elements
          window.model3.traverse((node) => {
            if (node.isMesh && node.material) {
              // Customize materials as needed
              if (node.material.name === "Material") {
                node.material.color.setHex(0x07142b);
                node.material.metalness = 0.5;
                node.material.roughness = 0.1;
              }

              if (node.material.name === "Material.004") {
                node.material.emissive = new THREE.Color(0x4b2a07);
                node.material.emissiveIntensity = 20;
              }
            }

            if (node.isCamera) {
              camera = node;
            }
          });

        gltf.animations.forEach((clip) => {
          if (independentAnimationsScene3.includes(clip.name)) {
            const mixer = new THREE.AnimationMixer(window.model3);
            const action = mixer.clipAction(clip);
            action.loop = THREE.LoopRepeat;
            action.play();
            independentMixersScene3[clip.name] = mixer;
          }
        });
      }, undefined, (error) => {
        console.error('Error loading SCENE3-NXNB.glb:', error);
      });

      // Load SCENE4-NXNB.glb
      loadModelWithProgress(
        3,
        "SCENE4-NXNB.glb",
        (gltf) => {
          window.model4 = gltf.scene;
          window.model4.visible = false; // Initially hidden
          scene.add(window.model4);

          // Traverse through loaded scene elements
          window.model4.traverse((node) => {
            if (node.isMesh && node.material) {
              // Customize materials as needed
              if (node.material.name === "Material") {
                node.material.color.setHex(0x07142b);
                node.material.metalness = 0.5;
                node.material.roughness = 0.1;
              }

              if (node.material.name === "Material.004") {
                node.material.emissive = new THREE.Color(0x4b2a07);
                node.material.emissiveIntensity = 20;
              }
            }

            if (node.isCamera) {
              camera = node;
            }
          });

        gltf.animations.forEach((clip) => {
          if (independentAnimationsScene4.includes(clip.name)) {
            const mixer = new THREE.AnimationMixer(window.model4);
            const action = mixer.clipAction(clip);
            action.loop = THREE.LoopRepeat;
            action.play();
            independentMixersScene4[clip.name] = mixer;
          }
        });
      }, undefined, (error) => {
        console.error('Error loading SCENE4-NXNB.glb:', error);
      });

      // ========== SCENE 5 ==========
      loadModelWithProgress(
        4,
        "SCENE5-NXNB.glb",
        (gltf) => {
        window.model5 = gltf.scene;
        window.model5.visible = false;  // Initially hidden
        scene.add(window.model5);

        window.model5.traverse((node) => {
          if (node.isMesh && node.material) {
            if (node.material.name === "Material") {
              node.material.color.setHex(0x07142B);
              node.material.metalness = 0.5;
              node.material.roughness = 0.1;
            }
            if (node.material.name === "Material.004") {
              node.material.emissive = new THREE.Color(0x4B2A07);
              node.material.emissiveIntensity = 20; 
            } 
          } 
          if (node.isCamera) {
            camera = node;
          }
        }); 

        // Assign independent (looping) animations for Scene 5
        gltf.animations.forEach((clip) => {
          if (independentAnimationsScene5.includes(clip.name)) {
            const mixer = new THREE.AnimationMixer(window.model5);
            const action = mixer.clipAction(clip);
            action.loop = THREE.LoopRepeat;
            action.play();
            independentMixersScene5[clip.name] = mixer;
          }
        });

        console.log('SCENE5 loaded and animations assigned.');
      }, undefined, (error) => {
        console.error('Error loading SCENE5-NXNB.glb:', error);
      });

      // ========== SCENE 6 ==========
      loadModelWithProgress(
        5,
        "SCENE6-NXNB.glb",
        (gltf) => { // === Scene 6 ===
        window.model6 = gltf.scene;
        window.model6.visible = false; // Initially hidden
        scene.add(window.model6);

        window.model6.traverse((node) => {
          if (node.isMesh && node.material) {
            if (node.material.name === "Material") {
              node.material.color.setHex(0x07142B); // Customize as needed
              node.material.metalness = 0.5;
              node.material.roughness = 0.1;
            }
            if (node.material.name === "Material.004") {
              node.material.emissive = new THREE.Color(0x4B2A07);
              node.material.emissiveIntensity = 20;
            }
          }
          if (node.isCamera) {
            camera = node;
          }
        });

        // Assign independent (looping) animations for Scene 6
        gltf.animations.forEach((clip) => {
          if (independentAnimationsScene6.includes(clip.name)) {
            const mixer = new THREE.AnimationMixer(window.model6);
            const action = mixer.clipAction(clip);
            action.loop = THREE.LoopRepeat;
            action.play();
            independentMixersScene6[clip.name] = mixer;
          }
        });

        // === Assign Main (Scroll-Controlled) Animations for Scene 6 ===
        gltf.animations.forEach((clip) => {
          if (!independentAnimationsScene6.includes(clip.name)) {
            if (!mainMixerScene6) {
              mainMixerScene6 = new THREE.AnimationMixer(window.model6);
            }
            const mainAction = mainMixerScene6.clipAction(clip);
            mainAction.play();
            // Do not set loop for main animations
          }
        });

        console.log('SCENE6 loaded and animations assigned.');
      }, undefined, (error) => {
        console.error('Error loading SCENE6-NXNB.GLB:', error);
      });
    }

    // -------------------- Setup Event Listeners --------------------
    function setupEventListeners() {
      window.addEventListener('resize', onWindowResize);
      window.addEventListener('wheel', onWheel, { passive: false });
      window.addEventListener('touchmove', preventTouchScroll, { passive: false });
    }
    
    // Prevent touch scrolling initially
    function preventTouchScroll(event) {
      if (!isRenderingEnabled) {
        event.preventDefault();
      }
    }
    
    // Modify the onWheel handler to respect the flag
    function onWheel(event) {
      if (!isRenderingEnabled) {
        event.preventDefault(); // Prevent default scroll behavior
        return; // Do not proceed with scroll handling
      }
    
      const delta = event.deltaY;
      const timeIncrement = framesPerScroll / FPS;
      targetScrollPosition += delta > 0 ? timeIncrement : -timeIncrement;
      targetScrollPosition = Math.max(0, Math.min(maxScrollFrames / FPS, targetScrollPosition));
    }

    // ==================== Setup Button Controls ====================
function setupButtonControls() {
  document
    .getElementById("scene1Button")
    .addEventListener("click", () => {
      targetScrollPosition = 0; // Scene1
    });

  document
    .getElementById("scene2Button")
    .addEventListener("click", () => {
      targetScrollPosition = frameSwitch1 / FPS; // Scene2
    });

  document
    .getElementById("scene3Button")
    .addEventListener("click", () => {
      targetScrollPosition = frameSwitch2 / FPS; // Scene3
    });

  document
    .getElementById("scene4Button")
    .addEventListener("click", () => {
      targetScrollPosition = frameSwitch4 / FPS; // Scene4
    });

  document.getElementById('scene5Button').addEventListener('click', () => {
    targetScrollPosition = frameSwitch5 / FPS; 
  });

  document.getElementById('scene6Button').addEventListener('click', () => {
    targetScrollPosition = frameSwitch6 / FPS; 
  });

  // Handle Play Audio button for Mute/Unmute only
  document.getElementById('audioTrigger').addEventListener('click', () => {
    if (audioInitialized) { // Ensure audio has been initialized before toggling
      toggleMuteAudio();
    } else {
      console.warn('Audio has not been initialized. Please press "Enter Experience" first.');
    }
  });

  // Handle "Enter Experience" button
  const enterExperienceButton = document.getElementById("enterExperience");
  if (enterExperienceButton) {
    enterExperienceButton.addEventListener("click", () => {
      // 1. Fade out audioInstruction
      const audioinstructionScreen = document.getElementById("audio-instruction-screen");
      if (audioinstructionScreen) {
        audioinstructionScreen.classList.add("hide");
      } else {
        console.warn('Element with ID "audio-instruction-screen" not found.');
      }

      // 2. Show 3D canvas
      const canvas3d = document.querySelector("canvas");
      if (canvas3d) {
        canvas3d.style.display = "block";
      } else {
        console.warn('Canvas element not found.');
      }

      // 3. Initialize and start audio playback
      initializeAudioPlayback();

      // 4. Enable scrolling
      isRenderingEnabled = true;
      document.body.classList.remove('no-scroll');
      document.body.style.overflow = 'auto';

      // 5. Remove touchmove prevention
      window.removeEventListener('touchmove', preventTouchScroll);

      // 6. Reset to frame 0
      targetScrollPosition = 0;

      // Optional: If instant reset is desired (may cause abrupt jump)
      // scrollPosition = 0;

      // Automatically show popup after entering experience
    document.getElementById("popup-container").style.display = "flex"; 
    });
  } else {
    console.error('Button with ID "enterExperience" not found.');
  }
}


// Example to toggle freeze state
document.getElementById("audioTrigger").addEventListener("click", () => {
  document.body.classList.toggle("freeze-animation");
});




    // -------------------- Initialize Audio Playback --------------------
    function initializeAudioPlayback() {
      // Attempt to play all audio objects to unlock them
      const audioPromises = [
        scene1Audio.play(),
        scene2Audio.play(),
        scene3Audio.play(),
        scene4Audio.play(),
        scene5Audio.play(),
        scene6Audio.play()
      ];

      Promise.allSettled(audioPromises).then((results) => {
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Scene ${index + 1} Audio playback failed:`, result.reason);
          } else {
            // Immediately pause after playing to unlock the audio
            switch(index + 1) {
              case 1:
                scene1Audio.pause();
                break;
              case 2:
                scene2Audio.pause();
                break;
              case 3:
                scene3Audio.pause();
                break;
              case 4:
                scene4Audio.pause();
                break;
              case 5:
                scene5Audio.pause();
                break;
              case 6:
                scene6Audio.pause();
                break;
            }
          }
        });

        audioInitialized = true;
        isMuted = false; // Ensure audio starts unmuted after initialization
        updatePlayAudioButton();

        const playAudioBtn = document.getElementById('audioTrigger');
    if (playAudioBtn) {
      playAudioBtn.disabled = false;
      playAudioBtn.style.opacity = 1; // Remove visual indication of disabled state
      playAudioBtn.title = "Mute/Unmute Audio";
    }
      });
    }

    // -------------------- Toggle Mute/Unmute Audio --------------------
    function toggleMuteAudio() {
      isMuted = !isMuted;
      updatePlayAudioButton();
    }

    // -------------------- Update Play Audio Button Text --------------------
function updatePlayAudioButton() {
  const button = document.getElementById('playAudioButton');
  if (!audioInitialized) {
    button.textContent = 'Play Audio';
  } else {
    button.textContent = isMuted ? 'Unmute Audio' : 'Mute Audio';
  }
}


    // ==================== Event Handler Functions ====================
    function onWindowResize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (camera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      }
    }

    function onWheel(event) {
      const delta = event.deltaY;
      const timeIncrement = framesPerScroll / FPS;
      targetScrollPosition += delta > 0 ? timeIncrement : -timeIncrement;
      targetScrollPosition = Math.max(0, Math.min(maxScrollFrames / FPS, targetScrollPosition));
    }

    // ==================== Animation Loop ====================
    function animate() {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();

      // Smooth scroll approach
      scrollPosition += (targetScrollPosition - scrollPosition) * easeFactor;
      const currentFrame = Math.floor(scrollPosition * FPS);

      // Define the frame at which to reset
      const resetFrame = 2575;

      // Add this line to see frame count in the browser console
  console.log(`Current Frame: ${currentFrame}`);

      // Automatically press the "Go to Scene 1" button when reaching resetFrame
      if (currentFrame >= resetFrame && !resetTriggered) {
        document.getElementById('scene1Button').click();
        resetTriggered = true;
      } else if (currentFrame < resetFrame) {
        resetTriggered = false;
      }

      // Manage scene visibility and environment
      manageSceneVisibility(currentFrame);
      switchHDRI(currentFrame);
      switchFog(currentFrame);

      // Manage Audio based on current frame
      manageAudio(currentFrame);

      // Update main scroll-based mixers
      if (mainMixer) {
        mainMixer.setTime(scrollPosition);
      }
      if (mainMixerScene6) {
        mainMixerScene6.setTime(scrollPosition);
      }

      // Update all independent mixers
      for (const mixer of Object.values(independentMixersScene1))  mixer.update(delta);
      for (const mixer of Object.values(independentMixersScene2))  mixer.update(delta);
      for (const mixer of Object.values(independentMixersScene3))  mixer.update(delta);
      for (const mixer of Object.values(independentMixersScene4))  mixer.update(delta);
      for (const mixer of Object.values(independentMixersScene5))  mixer.update(delta);
      for (const mixer of Object.values(independentMixersScene6))  mixer.update(delta); // === Scene 6 ===


      handleFade(currentFrame, ["scroll-instruction", "svg-home-screen-logo"], 1, 20);

      handleMiniLogoAppearance(currentFrame);

      handlePopup1Visibility(currentFrame);
      handlePopup2Visibility(currentFrame);
      handlePopup3Visibility(currentFrame);
      handlePopup4Visibility(currentFrame);
      handlePopup5Visibility(currentFrame);
      handlePopup6Visibility(currentFrame);
     

      renderer.render(scene, camera);
    }


  // ==================== Fade Function for Multiple Elements ====================
function handleFade(currentFrame, elementIds, fadeStartFrame, fadeDuration) {
  elementIds.forEach(id => {
      const element = document.getElementById(id);
      if (!element) return; // Skip if the element doesn't exist

      if (currentFrame >= fadeStartFrame && currentFrame < (fadeStartFrame + fadeDuration)) {
          // Fade Out
          const progress = (currentFrame - fadeStartFrame) / fadeDuration;
          const opacity = 1 - progress;
          element.style.opacity = opacity;
          element.style.display = "flex"; // Ensure it's visible during fade
      } else if (currentFrame >= (fadeStartFrame + fadeDuration)) {
          // Fully Faded Out
          element.style.opacity = 0;
          element.style.display = "none"; // Remove from layout
      } else if (currentFrame >= (fadeStartFrame - fadeDuration) && currentFrame < fadeStartFrame) {
          // Fade In
          const progress = (currentFrame - (fadeStartFrame - fadeDuration)) / fadeDuration;
          const opacity = progress;
          element.style.opacity = opacity;
          element.style.display = "flex"; // Ensure it's visible during fade
      } else {
          // Fully Visible
          element.style.opacity = 1;
          element.style.display = "flex"; // Ensure it's visible
      }
  });
}
       
function handleMiniLogoAppearance(currentFrame) {
  const miniLogo = document.getElementById("svg-home-screen-logo-mini");
  if (!miniLogo) return; // Exit if the element doesn't exist

  // Define the frame after which the mini logo should appear
  const appearanceFrame = 20;

  if (currentFrame >= appearanceFrame) {
      if (miniLogo.style.display !== "flex") { // Assuming you want to use flex
          miniLogo.style.display = "flex";
          // Trigger reflow to ensure transition occurs
          void miniLogo.offsetWidth;
          miniLogo.style.opacity = 1;
      }
  } else {
      if (miniLogo.style.display !== "none") {
          miniLogo.style.opacity = 0;
          // Wait for the transition to complete before hiding
          setTimeout(() => {
              miniLogo.style.display = "none";
          }, 500); // Match the CSS transition duration
      }
  }
}
  

    // -------------------- Manage Scene Visibility --------------------
    function manageSceneVisibility(currentFrame) {
      // Wait until all models are loaded
      if (!window.model1 || !window.model2 || !window.model3 || !window.model4 || !window.model5 || !window.model6) return;

      if (currentFrame < frameSwitch1) {
        // Scene 1
        window.model1.visible = true;
        window.model2.visible = false;
        window.model3.visible = false;
        window.model4.visible = false;
        window.model5.visible = false;
        window.model6.visible = false;

        // Lights
        scene1DirectionalLight.visible = true;
        scene1AmbientLight.visible = true;
        scene2DirectionalLight.visible = false;
        scene2AmbientLight.visible = false;
        scene2Light.visible = false;
        scene3DirectionalLight.visible = false;
        scene3AmbientLight.visible = false;
        scene4DirectionalLight.visible = false;
        scene4AmbientLight.visible = false;
        scene5DirectionalLight.visible = false;
        scene5AmbientLight.visible = false;
        scene6DirectionalLight.visible = false;
        scene6AmbientLight.visible = false;      

      } else if (currentFrame < frameSwitch2) {
        // Scene 2
        window.model1.visible = false;
        window.model2.visible = true;
        window.model3.visible = false;
        window.model4.visible = false;
        window.model5.visible = false;
        window.model6.visible = false;

        // Lights
        scene1DirectionalLight.visible = false;
        scene1AmbientLight.visible = false;
        scene2DirectionalLight.visible = true;
        scene2AmbientLight.visible = true;
        scene2Light.visible = true;
        scene3DirectionalLight.visible = false;
        scene3AmbientLight.visible = false;
        scene4DirectionalLight.visible = false;
        scene4AmbientLight.visible = false;
        scene5DirectionalLight.visible = false;
        scene5AmbientLight.visible = false;
        scene6DirectionalLight.visible = false;
        scene6AmbientLight.visible = false;   

      } else if (currentFrame < frameSwitch4) {
        // Scene 3
        window.model1.visible = false;
        window.model2.visible = false;
        window.model3.visible = true;
        window.model4.visible = false;
        window.model5.visible = false;
        window.model6.visible = false;

        // Lights
        scene1DirectionalLight.visible = false;
        scene1AmbientLight.visible = false;
        scene2DirectionalLight.visible = false;
        scene2AmbientLight.visible = false;
        scene2Light.visible = false;
        scene3DirectionalLight.visible = true;
        scene3AmbientLight.visible = true;
        scene4DirectionalLight.visible = false;
        scene4AmbientLight.visible = false;
        scene5DirectionalLight.visible = false;
        scene5AmbientLight.visible = false;
        scene6DirectionalLight.visible = false; 
        scene6AmbientLight.visible = false;     

      } else if (currentFrame < frameSwitch5) {
        // Scene 4
        window.model1.visible = false;
        window.model2.visible = false;
        window.model3.visible = false;
        window.model4.visible = true;
        window.model5.visible = false;
        window.model6.visible = false;

        // Lights
        scene1DirectionalLight.visible = false;
        scene1AmbientLight.visible = false;
        scene2DirectionalLight.visible = false;
        scene2AmbientLight.visible = false;
        scene2Light.visible = false;
        scene3DirectionalLight.visible = false;
        scene3AmbientLight.visible = false;
        scene4DirectionalLight.visible = true;
        scene4AmbientLight.visible = true;
        scene5DirectionalLight.visible = false;
        scene5AmbientLight.visible = false;
        scene6DirectionalLight.visible = false; 
        scene6AmbientLight.visible = false;      

      } else if (currentFrame < frameSwitch6) {
        // Scene 5
        window.model1.visible = false;
        window.model2.visible = false;
        window.model3.visible = false;
        window.model4.visible = false;
        window.model5.visible = true;
        window.model6.visible = false;

        // Lights
        scene1DirectionalLight.visible = false;
        scene1AmbientLight.visible = false;
        scene2DirectionalLight.visible = false;
        scene2AmbientLight.visible = false;
        scene2Light.visible = false;
        scene3DirectionalLight.visible = false;
        scene3AmbientLight.visible = false;
        scene4DirectionalLight.visible = false;
        scene4AmbientLight.visible = false;
        scene5DirectionalLight.visible = true;
        scene5AmbientLight.visible = true;
        scene6DirectionalLight.visible = false; 
        scene6AmbientLight.visible = false;      

      } else {
        // Scene 6
        window.model1.visible = false;
        window.model2.visible = false;
        window.model3.visible = false;
        window.model4.visible = false;
        window.model5.visible = false;
        window.model6.visible = true;

        // Lights
        scene1DirectionalLight.visible = false;
        scene1AmbientLight.visible = false;
        scene2DirectionalLight.visible = false;
        scene2AmbientLight.visible = false;
        scene2Light.visible = false;
        scene3DirectionalLight.visible = false;
        scene3AmbientLight.visible = false;
        scene4DirectionalLight.visible = false;
        scene4AmbientLight.visible = false;
        scene5DirectionalLight.visible = false;
        scene5AmbientLight.visible = false;
        scene6DirectionalLight.visible = true;
        scene6AmbientLight.visible = true;     
      }
    }

    // -------------------- Switch HDRI --------------------
    function switchHDRI(currentFrame) {
      if (currentFrame < frameSwitch1 && hdrScene1) {
        scene.environment = hdrScene1;
        adjustEnvMapIntensity(window.model1, 2.0);
        adjustEnvMapIntensity(window.model2, 0.0);
        adjustEnvMapIntensity(window.model3, 0.0);
        adjustEnvMapIntensity(window.model4, 0.0);
        adjustEnvMapIntensity(window.model5, 0.0);
        adjustEnvMapIntensity(window.model6, 0.0);

      } else if (currentFrame >= frameSwitch1 && currentFrame < frameSwitch2 && hdrScene2) {
        scene.environment = hdrScene2;
        adjustEnvMapIntensity(window.model1, 0.0);
        adjustEnvMapIntensity(window.model2, 0.5);
        adjustEnvMapIntensity(window.model3, 0.0);
        adjustEnvMapIntensity(window.model4, 0.0);
        adjustEnvMapIntensity(window.model5, 0.0);
        adjustEnvMapIntensity(window.model6, 0.0);

      } else if (currentFrame >= frameSwitch2 && currentFrame < frameSwitch4 && hdrScene3) {
        scene.environment = hdrScene3;
        adjustEnvMapIntensity(window.model1, 0.0);
        adjustEnvMapIntensity(window.model2, 0.0);
        adjustEnvMapIntensity(window.model3, 0.5);
        adjustEnvMapIntensity(window.model4, 0.0);
        adjustEnvMapIntensity(window.model5, 0.0);
        adjustEnvMapIntensity(window.model6, 0.0);

      } else if (currentFrame >= frameSwitch4 && currentFrame < frameSwitch5 && hdrScene4) {
        scene.environment = hdrScene4;
        adjustEnvMapIntensity(window.model1, 0.0);
        adjustEnvMapIntensity(window.model2, 0.0);
        adjustEnvMapIntensity(window.model3, 0.0);
        adjustEnvMapIntensity(window.model4, 1.0);
        adjustEnvMapIntensity(window.model5, 0.0);
        adjustEnvMapIntensity(window.model6, 0.0);

      } else if (currentFrame >= frameSwitch5 && currentFrame < frameSwitch6 && hdrScene5) {
        scene.environment = hdrScene5;
        adjustEnvMapIntensity(window.model1, 0.0);
        adjustEnvMapIntensity(window.model2, 0.0);
        adjustEnvMapIntensity(window.model3, 0.0);
        adjustEnvMapIntensity(window.model4, 0.0);
        adjustEnvMapIntensity(window.model5, 1.0);
        adjustEnvMapIntensity(window.model6, 0.0);

      } else if (currentFrame >= frameSwitch6 && hdrScene6) { // === Scene 6 ===
        scene.environment = hdrScene6;
        adjustEnvMapIntensity(window.model1, 0.0);
        adjustEnvMapIntensity(window.model2, 0.0);
        adjustEnvMapIntensity(window.model3, 0.0);
        adjustEnvMapIntensity(window.model4, 0.0);
        adjustEnvMapIntensity(window.model5, 0.0);
        adjustEnvMapIntensity(window.model6, 1.0);
      }
    }

    // -------------------- Switch Fog Parameters --------------------
    function switchFog(currentFrame) {
      if (currentFrame < frameSwitch1) {
        // Scene 1
        scene.fog.color.set(fogParams.scene1.color);
        scene.fog.near = fogParams.scene1.near;
        scene.fog.far = fogParams.scene1.far;
        renderer.setClearColor(fogParams.scene1.color);

      } else if (currentFrame < frameSwitch805) {
        // Scene 2 part 1
        scene.fog.color.set(fogParams.scene2_part1.color);
        scene.fog.near = fogParams.scene2_part1.near;
        scene.fog.far = fogParams.scene2_part1.far;
        renderer.setClearColor(fogParams.scene2_part1.color);

      } else if (currentFrame < frameSwitch2) {
        // Scene 2 part 2
        scene.fog.color.set(fogParams.scene2_part2.color);
        scene.fog.near = fogParams.scene2_part2.near;
        scene.fog.far = fogParams.scene2_part2.far;
        renderer.setClearColor(fogParams.scene2_part2.color);

      } else if (currentFrame < frameSwitch4) {
        // Scene 3
        scene.fog.color.set(fogParams.scene3.color);
        scene.fog.near = fogParams.scene3.near;
        scene.fog.far = fogParams.scene3.far;
        renderer.setClearColor(fogParams.scene3.color);

      } else if (currentFrame < frameSwitch5) {
        // Scene 4
        scene.fog.color.set(fogParams.scene4.color);
        scene.fog.near = fogParams.scene4.near;
        scene.fog.far = fogParams.scene4.far;
        renderer.setClearColor(fogParams.scene4.color);

      } else if (currentFrame < frameSwitch6) {
        // Scene 5
        scene.fog.color.set(fogParams.scene5.color);
        scene.fog.near = fogParams.scene5.near;
        scene.fog.far = fogParams.scene5.far;
        renderer.setClearColor(fogParams.scene5.color);

      } else {
        // Scene 6
        scene.fog.color.set(fogParams.scene6.color);
        scene.fog.near = fogParams.scene6.near;
        scene.fog.far = fogParams.scene6.far;
        renderer.setClearColor(fogParams.scene6.color);
      }
    }

    // -------------------- Adjust Environment Map Intensity --------------------
    function adjustEnvMapIntensity(sceneModel, intensity) {
      if (!sceneModel) return;
      sceneModel.traverse((node) => {
        if (node.isMesh && node.material && node.material.envMap) {
          node.material.envMapIntensity = intensity;
          node.material.needsUpdate = true;
        }
      });
    }

    // ==================== Manage Audio ====================
    function manageAudio(currentFrame) {
      // Ensure audio is initialized before managing playback
      if (!audioInitialized) return;

      // ------------------ Scene 1 Audio Management ------------------
      if (currentFrame >= 0 && currentFrame <= 400) {
        // Start Scene 1 Audio
        if (scene1Audio.paused && !hasPlayedAudio1) {
          scene1Audio.currentTime = 0;
          scene1Audio.play().catch((error) => {
            console.error('Scene 1 Audio playback failed:', error);
          });
          hasPlayedAudio1 = true;
        }

        // Volume Calculation
        let volume1 = 0.05; // Starting volume
        if (currentFrame <= 293) {
          // Fade In: 0.05 to 0.5 over frames 1 to 293
          volume1 = 0.05 + ((currentFrame - 1) / 292) * 0.45;
          volume1 = Math.min(volume1, 0.4);
        } else if (currentFrame <= 400) {
          // Fade Out: 0.5 to 0 over frames 294 to 400
          volume1 = 0.4 - ((currentFrame - 293) / 107) * 0.4;
          volume1 = Math.max(volume1, 0);
        }

        // Apply Mute or Set Volume
        scene1Audio.volume = isMuted ? 0 : volume1;

      } else {
        // Stop Scene 1 Audio
        if (!scene1Audio.paused) {
          scene1Audio.pause();
          scene1Audio.currentTime = 0;
          hasPlayedAudio1 = false;
        }
      }

      // ------------------ Scene 2 Audio Management ------------------
      if (currentFrame >= 400 && currentFrame <= 875) {
        // Start Scene 2 Audio
        if (scene2Audio.paused && !hasPlayedAudio2) {
          scene2Audio.currentTime = 0;
          scene2Audio.play().catch((error) => {
            console.error('Scene 2 Audio playback failed:', error);
          });
          hasPlayedAudio2 = true;
        }

        // Volume Calculation
        let volume2 = 0;
        if (currentFrame <= 700) {
          // Fade In: 0 to 0.5 over frames 400 to 700
          volume2 = ((currentFrame - 400) / 300) * 0.5;
          volume2 = Math.min(volume2, 0.5);
        } else if (currentFrame <= 875) {
          // Fade Out: 0.5 to 0 over frames 701 to 875
          volume2 = 0.5 - ((currentFrame - 700) / 175) * 0.5;
          volume2 = Math.max(volume2, 0);
        }

        // Apply Mute or Set Volume
        scene2Audio.volume = isMuted ? 0 : volume2;

      } else {
        // Stop Scene 2 Audio
        if (!scene2Audio.paused) {
          scene2Audio.pause();
          scene2Audio.currentTime = 0;
          hasPlayedAudio2 = false;
        }
      }

      // ------------------ Scene 3 Audio Management ------------------
      if (currentFrame >= 879 && currentFrame <= 1260) {
        // Start Scene 3 Audio
        if (scene3Audio.paused && !hasPlayedAudio3) {
          scene3Audio.currentTime = 0;
          scene3Audio.play().catch((error) => {
            console.error('Scene 3 Audio playback failed:', error);
          });
          hasPlayedAudio3 = true;
        }

        // Volume Calculation
        let volume3 = 0;
        if (currentFrame <= 1110) {
          // Fade In: 0 to 0.4 over frames 879 to 1110
          volume3 = ((currentFrame - 879) / 231) * 0.4;
          volume3 = Math.min(volume3, 0.4);
        } else if (currentFrame <= 1260) {
          // Fade Out: 0.4 to 0 over frames 1111 to 1260
          volume3 = 0.4 - ((currentFrame - 1110) / 150) * 0.4;
          volume3 = Math.max(volume3, 0);
        }

        // Apply Mute or Set Volume
        scene3Audio.volume = isMuted ? 0 : volume3;

      } else {
        // Stop Scene 3 Audio
        if (!scene3Audio.paused) {
          scene3Audio.pause();
          scene3Audio.currentTime = 0;
          hasPlayedAudio3 = false;
        }
      }

      // ------------------ Scene 4 Audio Management ------------------
      if (currentFrame >= 1262 && currentFrame <= 1692) {
        // Start Scene 4 Audio
        if (scene4Audio.paused && !hasPlayedAudio4) {
          scene4Audio.currentTime = 0;
          scene4Audio.play().catch((error) => {
            console.error('Scene 4 Audio playback failed:', error);
          });
          hasPlayedAudio4 = true;
        }

        // Volume Calculation
        let volume4 = 0;
        if (currentFrame <= 1483) {
          // Fade In: 0 to 0.4 over frames 1262 to 1483
          volume4 = ((currentFrame - 1262) / (1483 - 1262)) * 0.4;
          volume4 = Math.min(volume4, 0.4);
        } else if (currentFrame <= 1692) {
          // Fade Out: 0.4 to 0 over frames 1484 to 1692
          volume4 = 0.4 - ((currentFrame - 1483) / (1692 - 1483)) * 0.4;
          volume4 = Math.max(volume4, 0);
        }

        // Apply Mute or Set Volume
        scene4Audio.volume = isMuted ? 0 : volume4;

      } else {
        // Stop Scene 4 Audio
        if (!scene4Audio.paused) {
          scene4Audio.pause();
          scene4Audio.currentTime = 0;
          hasPlayedAudio4 = false;
        }
      }
     
      // ------------------ Scene 5 Audio Management ------------------
      if (currentFrame >= 1685 && currentFrame <= 2225) {
        // Start Scene 5 Audio
        if (scene5Audio.paused && !hasPlayedAudio5) {
          scene5Audio.currentTime = 0;
          scene5Audio.play().catch((error) => {
            console.error('Scene 5 Audio playback failed:', error);
          });
          hasPlayedAudio5 = true;
        }

        // Volume Calculation
        let volume5 = 0;
        if (currentFrame <= 1870) {
          // Fade In: 0 to 0.4 over frames 1685 to 1870
          volume5 = ((currentFrame - 1685) / (1870 - 1685)) * 0.4;
          volume5 = Math.min(volume5, 0.4);
        } else if (currentFrame <= 2225) {
          // Fade Out: 0.4 to 0 over frames 1871 to 2225
          volume5 = 0.4 - ((currentFrame - 1870) / (2225 - 1870)) * 0.4;
          volume5 = Math.max(volume5, 0);
        }

        // Apply Mute or Set Volume
        scene5Audio.volume = isMuted ? 0 : volume5;

      } else {
        // Stop Scene 5 Audio
        if (!scene5Audio.paused) {
          scene5Audio.pause();
          scene5Audio.currentTime = 0;
          hasPlayedAudio5 = false;
        }
      }

      // ------------------ Scene 6 Audio Management ------------------
      if (currentFrame >= 2230 && currentFrame <= 2590) {
        // Start Scene 6 Audio
        if (scene6Audio.paused && !hasPlayedAudio6) {
          scene6Audio.currentTime = 0;
          scene6Audio.play().catch((error) => {
            console.error('Scene 6 Audio playback failed:', error);
          });
          hasPlayedAudio6 = true;
        }

        // Volume Calculation
        let volume6 = 0;
        if (currentFrame <= 2300) {
          // Fade In: 0 to 0.4 over frames 2230 to 2300
          volume6 = ((currentFrame - 2230) / (2300 - 2230)) * 0.4;
          volume6 = Math.min(volume6, 0.4);
        } else if (currentFrame <= 2590) {
          // Fade Out: 0.4 to 0 over frames 2301 to 2590
          volume6 = 0.4 - ((currentFrame - 2300) / (2590 - 2300)) * 0.4;
          volume6 = Math.max(volume6, 0);
        }

        // Apply Mute or Set Volume
        scene6Audio.volume = isMuted ? 0 : volume6;

      } else {
        // Stop Scene 6 Audio
        if (!scene6Audio.paused) {
          scene6Audio.pause();
          scene6Audio.currentTime = 0;
          hasPlayedAudio6 = false;
        }
      }
    }

    // ==================== Start the Application ====================
    init();
    animate();

//Toggle side nav// 

document.addEventListener("DOMContentLoaded", () => {
  const openSideNav = document.getElementById("openSideNav");
  const closeSideNav = document.getElementById("closeSideNav");
  const sideNavigation = document.getElementById("side-navigation");
  const sidenavMenus = document.querySelectorAll(".sidenav-menu");

  // Open the side navigation
  openSideNav.addEventListener("click", () => {
    sideNavigation.classList.add("active");
  });

  // Close the side navigation
  closeSideNav.addEventListener("click", () => {
    sideNavigation.classList.remove("active");
  });

  // Close the side navigation when any .sidenav-menu is clicked
  sidenavMenus.forEach((menu) => {
    menu.addEventListener("click", () => {
      sideNavigation.classList.remove("active");
    });
  });
});


//SOUNDWAVE// 

document.addEventListener("DOMContentLoaded", () => {
  const waves = document.querySelectorAll(".soundwave");
  console.log(waves); // Should display a NodeList of `.soundwave` elements
});


document.addEventListener("DOMContentLoaded", () => {
  const waves = document.querySelectorAll(".soundwave");

  let currentWave = 0;

  function animateWaves() {
    // Reset all waves
    waves.forEach((wave) => {
      wave.style.opacity = "0.5";
      wave.style.transform = "scale(1)";
    });

    // Animate the current wave
    waves[currentWave].style.opacity = "1";
    waves[currentWave].style.transform = "scale(1.5)";

    // Move to the next wave
    currentWave = (currentWave + 1) % waves.length;

    setTimeout(animateWaves, 300); // Adjust timing (300ms between waves)
  }

  // Start animation
  animateWaves();
});


function handlePopup1Visibility(currentFrame) {
  const progressPopup1 = document.getElementById("progress-popup1");
  const progressPopup1H4 = document.getElementById("progress-popup1-h4");
  const progressPopup1P  = document.getElementById("progress-popup1-p");
  const openOverlay01    = document.getElementById("openOverlay01");

  if (!progressPopup1 || !progressPopup1H4 || !progressPopup1P || !openOverlay01) {
    return; // Safety check in case elements aren't found
  }

  // 1) Hide everything by default
  progressPopup1.style.display  = "none";
  progressPopup1H4.style.display = "none";
  progressPopup1P.style.display  = "none";
  openOverlay01.style.display    = "none";

  // 2) At frame >= 260 -> show #progress-popup1 & #progress-popup1-h4
  if (currentFrame >= 100) {
    progressPopup1.style.display  = "flex";
    progressPopup1H4.style.display = "flex";
  }

  // 3) At frame >= 270 -> also show #progress-popup1-p
  if (currentFrame >= 150) {
    progressPopup1P.style.display  = "flex";
  }

  // 4) At frame >= 280 -> show #openOverlay01
  if (currentFrame >= 200) {
    openOverlay01.style.display    = "flex";
  }

  // 5) Hide all again at frame >= 360
  if (currentFrame >= 320) {
    progressPopup1.style.display   = "none";
    progressPopup1H4.style.display = "none";
    progressPopup1P.style.display  = "none";
    openOverlay01.style.display    = "none";
  }
}


function handlePopup2Visibility(currentFrame) {
  const progressPopup2 = document.getElementById("progress-popup2");
  const progressPopup2H4 = document.getElementById("progress-popup2-h4");
  const progressPopup2P  = document.getElementById("progress-popup2-p");
  const openOverlay02    = document.getElementById("openOverlay02");

  if (!progressPopup2 || !progressPopup2H4 || !progressPopup2P || !openOverlay02) {
    return; // Safety check in case elements aren't found
  }

  // 1) Hide everything by default
  progressPopup2.style.display  = "none";
  progressPopup2H4.style.display = "none";
  progressPopup2P.style.display  = "none";
  openOverlay02.style.display    = "none";

  // 2) At frame >= 260 -> show #progress-popup1 & #progress-popup1-h4
  if (currentFrame >= 480) {
    progressPopup2.style.display  = "flex";
    progressPopup2H4.style.display = "flex";
  }

  // 3) At frame >= 270 -> also show #progress-popup1-p
  if (currentFrame >= 580) {
    progressPopup2P.style.display  = "flex";
  }

  // 4) At frame >= 280 -> show #openOverlay01
  if (currentFrame >= 680) {
    openOverlay02.style.display    = "flex";
  }

  // 5) Hide all again at frame >= 360
  if (currentFrame >= 825) {
    progressPopup2.style.display   = "none";
    progressPopup2H4.style.display = "none";
    progressPopup2P.style.display  = "none";
    openOverlay02.style.display    = "none";
  }
}


function handlePopup3Visibility(currentFrame) {
  const progressPopup3   = document.getElementById("progress-popup3");
  const progressPopup3H4 = document.getElementById("progress-popup3-h4");
  const progressPopup3P  = document.getElementById("progress-popup3-p");
  const openOverlay03    = document.getElementById("openOverlay03");

  if (!progressPopup3 || !progressPopup3H4 || !progressPopup3P || !openOverlay03) {
    return; // Safety check
  }

  // 1) Hide everything by default
  progressPopup3.style.display   = "none";
  progressPopup3H4.style.display = "none";
  progressPopup3P.style.display  = "none";
  openOverlay03.style.display    = "none";

  // 2) At frame >= 700 -> show popup3 & popup3-h4
  if (currentFrame >= 970) {
    progressPopup3.style.display   = "flex";
    progressPopup3H4.style.display = "flex";
  }

  // 3) At frame >= 750 -> show popup3-p
  if (currentFrame >= 1075) {
    progressPopup3P.style.display = "flex";
  }

  // 4) At frame >= 800 -> show #openOverlay03
  if (currentFrame >= 1125) {
    openOverlay03.style.display = "flex";
  }

  // 5) Hide all again at frame >= 1025
  if (currentFrame >= 1260) {
    progressPopup3.style.display   = "none";
    progressPopup3H4.style.display = "none";
    progressPopup3P.style.display  = "none";
    openOverlay03.style.display    = "none";
  }
}


function handlePopup4Visibility(currentFrame) {
  const progressPopup4   = document.getElementById("progress-popup4");
  const progressPopup4H4 = document.getElementById("progress-popup4-h4");
  const progressPopup4P  = document.getElementById("progress-popup4-p");
  const openOverlay04    = document.getElementById("openOverlay04");

  if (!progressPopup4 || !progressPopup4H4 || !progressPopup4P || !openOverlay04) {
    return; // Safety check
  }

  // 1) Hide everything by default
  progressPopup4.style.display   = "none";
  progressPopup4H4.style.display = "none";
  progressPopup4P.style.display  = "none";
  openOverlay04.style.display    = "none";

  // 2) At frame >= 1100 -> show popup4 & popup4-h4
  if (currentFrame >= 1320) {
    progressPopup4.style.display   = "flex";
    progressPopup4H4.style.display = "flex";
  }

  // 3) At frame >= 1150 -> show popup4-p
  if (currentFrame >= 1390) {
    progressPopup4P.style.display = "flex";
  }

  // 4) At frame >= 1200 -> show #openOverlay04
  if (currentFrame >= 1440) {
    openOverlay04.style.display = "flex";
  }

  // 5) Hide all again at frame >= 1375
  if (currentFrame >= 1685) {
    progressPopup4.style.display   = "none";
    progressPopup4H4.style.display = "none";
    progressPopup4P.style.display  = "none";
    openOverlay04.style.display    = "none";
  }
}


function handlePopup5Visibility(currentFrame) {
  const progressPopup5   = document.getElementById("progress-popup5");
  const progressPopup5H4 = document.getElementById("progress-popup5-h4");
  const progressPopup5P  = document.getElementById("progress-popup5-p");
  const openOverlay05    = document.getElementById("openOverlay05");

  if (!progressPopup5 || !progressPopup5H4 || !progressPopup5P || !openOverlay05) {
    return; // Safety check
  }

  // 1) Hide everything by default
  progressPopup5.style.display   = "none";
  progressPopup5H4.style.display = "none";
  progressPopup5P.style.display  = "none";
  openOverlay05.style.display    = "none";

  // 2) At frame >= 1400 -> show popup5 & popup5-h4
  if (currentFrame >= 1770) {
    progressPopup5.style.display   = "flex";
    progressPopup5H4.style.display = "flex";
  }

  // 3) At frame >= 1450 -> show popup5-p
  if (currentFrame >= 1870) {
    progressPopup5P.style.display = "flex";
  }

  // 4) At frame >= 1500 -> show #openOverlay05
  if (currentFrame >= 1975) {
    openOverlay05.style.display = "flex";
  }

  // 5) Hide all again at frame >= 1675
  if (currentFrame >= 2160) {
    progressPopup5.style.display   = "none";
    progressPopup5H4.style.display = "none";
    progressPopup5P.style.display  = "none";
    openOverlay05.style.display    = "none";
  }
}


function handlePopup6Visibility(currentFrame) {
  const progressPopup6   = document.getElementById("progress-popup6");
  const progressPopup6H4 = document.getElementById("progress-popup6-h4");
  const progressPopup6P  = document.getElementById("progress-popup6-p"); // corrected
  const openOverlay06    = document.getElementById("openOverlay06");

  if (!progressPopup6 || !progressPopup6H4 || !progressPopup6P || !openOverlay06) {
    return; // Safety check
  }

  // 1) Hide everything by default
  progressPopup6.style.display   = "none";
  progressPopup6H4.style.display = "none";
  progressPopup6P.style.display  = "none";
  openOverlay06.style.display    = "none";

  // 2) At frame >= 1800 -> show popup6 & popup6-h4
  if (currentFrame >= 2200) {
    progressPopup6.style.display   = "flex";
    progressPopup6H4.style.display = "flex";
  }

  // 3) At frame >= 1850 -> show popup6-p
  if (currentFrame >= 2245) {
    progressPopup6P.style.display = "flex";
  }

  // 4) At frame >= 1900 -> show #openOverlay06
  if (currentFrame >= 2300) {
    openOverlay06.style.display = "flex";
  }

  // 5) Hide all again at frame >= 2075
  if (currentFrame >= 2525) {
    progressPopup6.style.display   = "none";
    progressPopup6H4.style.display = "none";
    progressPopup6P.style.display  = "none";
    openOverlay06.style.display    = "none";
  }
}


//open overlay//////

// ============== OVERLAY 01 ==============
// Close button -> hide overlay-01
const closeBtn01 = document.getElementById("closeOverlay01");
closeBtn01.addEventListener("click", () => {
  const overlay01 = document.getElementById("overlay-01");
  overlay01.classList.remove("show");
});

// Open button -> show overlay-01
const openBtn01 = document.getElementById("openOverlay01");
openBtn01.addEventListener("click", () => {
  const overlay01 = document.getElementById("overlay-01");
  overlay01.classList.add("show");
});


// ============== OVERLAY 02 ==============
// Close button -> hide overlay-02
const closeBtn02 = document.getElementById("closeOverlay02");
closeBtn02.addEventListener("click", () => {
  const overlay02 = document.getElementById("overlay-02");
  overlay02.classList.remove("show");
});

// Open button -> show overlay-02
const openBtn02 = document.getElementById("openOverlay02");
openBtn02.addEventListener("click", () => {
  const overlay02 = document.getElementById("overlay-02");
  overlay02.classList.add("show");
});

// ============== OVERLAY 03 ==============
// Close button -> hide overlay-03
const closeBtn03 = document.getElementById("closeOverlay03");
closeBtn03.addEventListener("click", () => {
  const overlay03 = document.getElementById("overlay-03");
  overlay03.classList.remove("show");
});

// Open button -> show overlay-02
const openBtn03 = document.getElementById("openOverlay03");
openBtn03.addEventListener("click", () => {
  const overlay03 = document.getElementById("overlay-03");
  overlay03.classList.add("show");
});

// ============== OVERLAY 04 ==============
// Close button -> hide overlay-04
const closeBtn04 = document.getElementById("closeOverlay04");
closeBtn04.addEventListener("click", () => {
  const overlay04 = document.getElementById("overlay-04");
  overlay04.classList.remove("show");
});

// Open button -> show overlay-04
const openBtn04 = document.getElementById("openOverlay04");
openBtn04.addEventListener("click", () => {
  const overlay04 = document.getElementById("overlay-04");
  overlay04.classList.add("show");
});


// ============== OVERLAY 05 ==============
// Close button -> hide overlay-05
const closeBtn05 = document.getElementById("closeOverlay05");
closeBtn05.addEventListener("click", () => {
  const overlay05 = document.getElementById("overlay-05");
  overlay05.classList.remove("show");
});

// Open button -> show overlay-05
const openBtn05 = document.getElementById("openOverlay05");
openBtn05.addEventListener("click", () => {
  const overlay05 = document.getElementById("overlay-05");
  overlay05.classList.add("show");
});


// ============== OVERLAY 06 ==============
// Close button -> hide overlay-06
const closeBtn06 = document.getElementById("closeOverlay06");
closeBtn06.addEventListener("click", () => {
  const overlay06 = document.getElementById("overlay-06");
  overlay06.classList.remove("show");
});

// Open button -> show overlay-06
const openBtn06 = document.getElementById("openOverlay06");
openBtn06.addEventListener("click", () => {
  const overlay06 = document.getElementById("overlay-06");
  overlay06.classList.add("show");
});

// Show popup when the SVG logo is clicked
document.getElementById("svg-home-screen-logo-mini").addEventListener("click", function() {
  document.getElementById("popup-container").style.display = "flex"; // Show the popup
});

// Close the popup when the close button is clicked
document.getElementById("close-popup").addEventListener("click", function() {
  document.getElementById("popup-container").style.display = "none"; // Hide the popup
});

// Add event listeners for touch events
document.addEventListener('touchstart', handleTouchStart, { passive: true });
document.addEventListener('touchmove', handleTouchMove, { passive: false }); // 'passive: false' allows us to call preventDefault()
document.addEventListener('touchend', handleTouchEnd, { passive: true });

// Variables to track touch positions
let startTouch = { x: 0, y: 0 };
let endTouch = { x: 0, y: 0 };

function handleTouchStart(event) {
  // Get the first touch position
  startTouch.x = event.touches[0].clientX;
  startTouch.y = event.touches[0].clientY;
}

function handleTouchMove(event) {
  if (!isRenderingEnabled) {
    event.preventDefault(); // Prevent default touch behavior (scrolling, zooming)
  }

  // Track touch position on move
  endTouch.x = event.touches[0].clientX;
  endTouch.y = event.touches[0].clientY;

  // Example: Calculate the touch movement and adjust scroll position
  let distanceY = endTouch.y - startTouch.y;

  // Update target scroll position based on vertical touch movement
  const timeIncrement = framesPerScroll / FPS;
  targetScrollPosition += distanceY > 0 ? timeIncrement : -timeIncrement;
  targetScrollPosition = Math.max(0, Math.min(maxScrollFrames / FPS, targetScrollPosition));

  // Update start touch for next movement
  startTouch.y = endTouch.y;
}


function handleTouchEnd(event) {
  // Reset touch positions after touch ends
  startTouch.x = 0;
  startTouch.y = 0;
  endTouch.x = 0;
  endTouch.y = 0;
}
