import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createNoise3D } from 'simplex-noise';

/**
 * PlaygroundScene Class
 * Creates and manages the 3D playground environment with interactive elements
 */
export class PlaygroundScene {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.interactiveObjects = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredObject = null;
        this.animatingObjects = new Map();
        this.clock = new THREE.Clock(); // For shader animations

        // Wind system
        this.noise3D = createNoise3D();
        this.windStrength = 0.5;
        this.windDirection = new THREE.Vector2(1, 0.3);
        this.grassBlades = [];
        this.treeFoliage = [];
        this.leaves = [];
        this.butterflies = [];
        this.clouds = [];
        this.birds = [];

        // Ball physics system
        this.balls = [];

        // Texture system
        this.textures = {};
        this.createProceduralTextures();

        this.init();
    }

    /**
     * Create procedural textures for realistic materials
     */
    createProceduralTextures() {
        // Grass texture with detail
        this.textures.grass = this.createGrassTexture();
        this.textures.grassNormal = this.createGrassNormalMap();

        // Wood textures
        this.textures.wood = this.createWoodTexture();
        this.textures.woodNormal = this.createWoodNormalMap();
        this.textures.darkWood = this.createWoodTexture(true);

        // Stone/Rock texture
        this.textures.stone = this.createStoneTexture();
        this.textures.stoneNormal = this.createStoneNormalMap();

        // Sand texture
        this.textures.sand = this.createSandTexture();
        this.textures.sandNormal = this.createSandNormalMap();

        // Concrete/Path texture
        this.textures.concrete = this.createConcreteTexture();
        this.textures.concreteNormal = this.createConcreteNormalMap();
    }

    /**
     * Create realistic grass texture
     */
    createGrassTexture() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Base grass color with variation
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const noise = Math.random();
                const r = Math.floor(75 + noise * 30);
                const g = Math.floor(140 + noise * 40);
                const b = Math.floor(70 + noise * 20);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(i, j, 1, 1);
            }
        }

        // Add grass blade patterns
        ctx.strokeStyle = 'rgba(60, 120, 60, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const length = 5 + Math.random() * 10;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + (Math.random() - 0.5) * 3, y - length);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(20, 20);
        return texture;
    }

    /**
     * Create grass normal map for depth
     */
    createGrassNormalMap() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Blue base (flat normal)
        ctx.fillStyle = 'rgb(128, 128, 255)';
        ctx.fillRect(0, 0, size, size);

        // Add bumps
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = 2 + Math.random() * 3;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgb(128, 128, 255)');
            gradient.addColorStop(1, 'rgb(128, 140, 240)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(20, 20);
        return texture;
    }

    /**
     * Create wood texture with grain
     */
    createWoodTexture(dark = false) {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Base wood color
        const baseR = dark ? 80 : 139;
        const baseG = dark ? 50 : 90;
        const baseB = dark ? 30 : 43;

        // Draw wood grain
        for (let y = 0; y < size; y++) {
            const grainVariation = Math.sin(y * 0.1 + Math.random() * 0.5) * 20;
            for (let x = 0; x < size; x++) {
                const noise = (Math.random() - 0.5) * 15;
                const r = baseR + grainVariation + noise;
                const g = baseG + grainVariation * 0.7 + noise;
                const b = baseB + grainVariation * 0.5 + noise;
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }

        // Add wood rings
        ctx.strokeStyle = `rgba(${baseR - 30}, ${baseG - 30}, ${baseB - 20}, 0.3)`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const y = (i / 8) * size + Math.random() * 40;
            ctx.beginPath();
            ctx.moveTo(0, y);
            for (let x = 0; x < size; x += 10) {
                ctx.lineTo(x, y + Math.sin(x * 0.05) * 5);
            }
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Create wood normal map
     */
    createWoodNormalMap() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgb(128, 128, 255)';
        ctx.fillRect(0, 0, size, size);

        // Add grain bumps
        for (let y = 0; y < size; y += 2) {
            const variation = Math.sin(y * 0.1) * 10;
            ctx.strokeStyle = `rgba(128, ${128 + variation}, 240, 0.5)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(size, y);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Create stone texture
     */
    createStoneTexture() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Base stone color with noise
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const noise = Math.random() * 40;
                const r = 100 + noise;
                const g = 100 + noise;
                const b = 100 + noise;
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(i, j, 1, 1);
            }
        }

        // Add cracks and details
        ctx.strokeStyle = 'rgba(60, 60, 60, 0.4)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 30; i++) {
            ctx.beginPath();
            let x = Math.random() * size;
            let y = Math.random() * size;
            ctx.moveTo(x, y);
            for (let j = 0; j < 5; j++) {
                x += (Math.random() - 0.5) * 40;
                y += (Math.random() - 0.5) * 40;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Create stone normal map
     */
    createStoneNormalMap() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgb(128, 128, 255)';
        ctx.fillRect(0, 0, size, size);

        // Add bumpy surface
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = 5 + Math.random() * 15;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgb(150, 150, 255)');
            gradient.addColorStop(0.5, 'rgb(128, 128, 255)');
            gradient.addColorStop(1, 'rgb(100, 100, 240)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Create sand texture
     */
    createSandTexture() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Sandy beige color with grain
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const noise = Math.random() * 30;
                const r = 220 + noise;
                const g = 190 + noise;
                const b = 130 + noise;
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(i, j, 1, 1);
            }
        }

        // Add sand grain clusters
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = 1 + Math.random() * 2;
            ctx.fillStyle = `rgba(200, 170, 110, ${Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Create sand normal map
     */
    createSandNormalMap() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgb(128, 128, 255)';
        ctx.fillRect(0, 0, size, size);

        // Subtle granular bumps
        for (let i = 0; i < 2000; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const variation = Math.random() * 20;
            ctx.fillStyle = `rgb(${128 + variation}, ${128 + variation}, ${240 + variation})`;
            ctx.fillRect(x, y, 1, 1);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Create concrete texture
     */
    createConcreteTexture() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Concrete gray with noise
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const noise = (Math.random() - 0.5) * 40;
                const val = 180 + noise;
                ctx.fillStyle = `rgb(${val},${val},${val})`;
                ctx.fillRect(i, j, 1, 1);
            }
        }

        // Add cracks
        ctx.strokeStyle = 'rgba(120, 120, 120, 0.6)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 15; i++) {
            ctx.beginPath();
            let x = Math.random() * size;
            let y = Math.random() * size;
            ctx.moveTo(x, y);
            for (let j = 0; j < 3; j++) {
                x += (Math.random() - 0.5) * 100;
                y += (Math.random() - 0.5) * 100;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // Add spots
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = 2 + Math.random() * 5;
            ctx.fillStyle = `rgba(${140 + Math.random() * 40}, ${140 + Math.random() * 40}, ${140 + Math.random() * 40}, 0.5)`;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Create concrete normal map
     */
    createConcreteNormalMap() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgb(128, 128, 255)';
        ctx.fillRect(0, 0, size, size);

        // Add rough surface detail
        for (let i = 0; i < 800; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = 2 + Math.random() * 5;
            const variation = (Math.random() - 0.5) * 30;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, `rgb(${128 + variation}, ${128 + variation}, ${255 - Math.abs(variation)})`);
            gradient.addColorStop(1, 'rgb(128, 128, 255)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Initialize the scene, camera, renderer, and controls
     */
    init() {
        // Scene setup with sunny sky color
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 100); // Atmospheric perspective

        // Camera setup - positioned to view the playground
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            200
        );
        this.camera.position.set(25, 15, 25);
        this.camera.lookAt(0, 0, 0);

        // Renderer setup with shadows enabled
        const canvas = document.getElementById('canvas');
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // OrbitControls for camera navigation
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 60;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent going below ground

        // Create the playground
        this.createLighting();
        this.createGround();
        this.createTrees();
        this.createFlowers();
        this.createSandbox();
        this.createSwingSet();
        this.createSlide();
        this.createBenches();
        this.createPath();
        this.createLamps();
        this.createSky();

        // Create living elements
        this.createAnimatedGrassBlades();
        this.createRocks();
        this.createBushes();
        this.createMushrooms();
        this.createClouds();
        this.createButterflies();
        this.createBirds();
        this.createFallingLeaves();

        // Create mini house
        this.createMiniHouse();

        // Create interactive balls
        this.createBalls();
    }

    /**
     * Create enhanced lighting system with hemisphere and directional lights
     */
    createLighting() {
        // Hemisphere light for sky/ground ambient lighting (more natural)
        const hemisphereLight = new THREE.HemisphereLight(
            0x87CEEB, // Sky color (light blue)
            0x5fb358, // Ground color (grass green)
            0.6
        );
        this.scene.add(hemisphereLight);

        // Warm ambient light for overall brightness
        const ambientLight = new THREE.AmbientLight(0xfff8dc, 0.3);
        this.scene.add(ambientLight);

        // Main directional light (sun) with optimized shadows
        const sunLight = new THREE.DirectionalLight(0xfff4e6, 1.2);
        sunLight.position.set(30, 40, 20);
        sunLight.castShadow = true;

        // Optimized shadow settings for performance
        sunLight.shadow.camera.left = -35;
        sunLight.shadow.camera.right = 35;
        sunLight.shadow.camera.top = 35;
        sunLight.shadow.camera.bottom = -35;
        sunLight.shadow.camera.near = 10;
        sunLight.shadow.camera.far = 80;
        sunLight.shadow.mapSize.width = 1024; // Reduced from 2048 for performance
        sunLight.shadow.mapSize.height = 1024;
        sunLight.shadow.bias = -0.0005;
        sunLight.shadow.radius = 2; // Soft shadows
        this.scene.add(sunLight);

        // Subtle fill light from opposite side (no shadows)
        const fillLight = new THREE.DirectionalLight(0x9db4ff, 0.3);
        fillLight.position.set(-20, 10, -10);
        this.scene.add(fillLight);

        // Store for later use
        this.sunLight = sunLight;
    }

    /**
     * Create the ground plane with realistic grass texture
     */
    createGround() {
        const groundGeometry = new THREE.CircleGeometry(50, 64);

        // Realistic grass material with texture and normal map
        const groundMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.grass,
            normalMap: this.textures.grassNormal,
            normalScale: new THREE.Vector2(0.5, 0.5),
            roughness: 0.9,
            metalness: 0.0,
            color: 0x5fb358
        });

        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.userData = { name: 'ground', type: 'environment', material: groundMaterial };
        this.scene.add(ground);

        // Store for reference
        this.groundMaterial = groundMaterial;

        // Add some grass tufts for visual interest
        this.createGrassTufts();
    }

    /**
     * Create decorative grass tufts scattered on the ground
     */
    createGrassTufts() {
        const tuftGeometry = new THREE.ConeGeometry(0.1, 0.4, 3);
        const tuftMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a9944,
            flatShading: true
        });

        for (let i = 0; i < 150; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 45;
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;

            const tuft = new THREE.Mesh(tuftGeometry, tuftMaterial);
            tuft.position.set(x, 0.2, z);
            tuft.rotation.y = Math.random() * Math.PI;
            tuft.scale.set(
                0.8 + Math.random() * 0.4,
                0.8 + Math.random() * 0.4,
                0.8 + Math.random() * 0.4
            );
            this.scene.add(tuft);
        }
    }

    /**
     * Create trees around the playground
     */
    createTrees() {
        const treePositions = [
            { x: -15, z: -15 },
            { x: 15, z: -15 },
            { x: -18, z: 10 },
            { x: 18, z: 12 },
            { x: -20, z: -5 },
            { x: 20, z: -3 }
        ];

        treePositions.forEach((pos, index) => {
            const tree = this.createTree(pos.x, pos.z);
            tree.userData = {
                name: `tree-${index}`,
                type: 'tree',
                interactive: true,
                description: 'A beautiful tree providing shade to the playground.'
            };
            this.interactiveObjects.push(tree);
        });
    }

    /**
     * Create a single tree with trunk and foliage
     */
    createTree(x, z) {
        const treeGroup = new THREE.Group();

        // Trunk with realistic wood texture
        const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.5, 3, 16);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.darkWood,
            normalMap: this.textures.woodNormal,
            normalScale: new THREE.Vector2(0.3, 0.3),
            roughness: 0.95,
            metalness: 0.0,
            color: 0x8b4513
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Foliage (3 spheres stacked) with animated shader
        const foliageGeometry = new THREE.SphereGeometry(2, 16, 16);

        // Custom shader for animated foliage
        const foliageMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uWindStrength: { value: this.windStrength },
                uBaseColor: { value: new THREE.Color(0x2d8b2d) },
                uTreePosition: { value: new THREE.Vector2(x, z) }
            },
            vertexShader: `
                uniform float uTime;
                uniform float uWindStrength;
                uniform vec2 uTreePosition;
                varying vec3 vNormal;
                varying vec3 vPosition;

                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;

                    vec3 pos = position;
                    // Wind sway based on height and tree position
                    float windWave = sin(uTime * 2.0 + uTreePosition.x * 0.5) * cos(uTime * 1.5 + uTreePosition.y * 0.5);
                    float heightFactor = (position.y + 2.0) / 4.0; // More movement at top
                    pos.x += windWave * uWindStrength * heightFactor * 0.3;
                    pos.z += sin(uTime * 1.8 + uTreePosition.x) * uWindStrength * heightFactor * 0.2;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uBaseColor;
                varying vec3 vNormal;
                varying vec3 vPosition;

                void main() {
                    vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
                    float diff = max(dot(vNormal, lightDir), 0.0);

                    // Toon shading
                    float toonDiff = step(0.3, diff) * 0.3 + step(0.6, diff) * 0.3 + step(0.9, diff) * 0.4;

                    vec3 color = uBaseColor * (toonDiff + 0.3);
                    gl_FragColor = vec4(color, 1.0);
                }
            `
        });

        const foliage1 = new THREE.Mesh(foliageGeometry, foliageMaterial.clone());
        foliage1.position.y = 4;
        foliage1.scale.set(1, 1, 1);
        foliage1.castShadow = true;
        treeGroup.add(foliage1);
        this.treeFoliage.push({ mesh: foliage1, material: foliage1.material, baseY: 4 });

        const foliage2 = new THREE.Mesh(foliageGeometry, foliageMaterial.clone());
        foliage2.position.y = 5.5;
        foliage2.scale.set(0.8, 0.8, 0.8);
        foliage2.castShadow = true;
        treeGroup.add(foliage2);
        this.treeFoliage.push({ mesh: foliage2, material: foliage2.material, baseY: 5.5 });

        const foliage3 = new THREE.Mesh(foliageGeometry, foliageMaterial.clone());
        foliage3.position.y = 6.5;
        foliage3.scale.set(0.5, 0.5, 0.5);
        foliage3.castShadow = true;
        treeGroup.add(foliage3);
        this.treeFoliage.push({ mesh: foliage3, material: foliage3.material, baseY: 6.5 });

        treeGroup.position.set(x, 0, z);
        this.scene.add(treeGroup);

        return treeGroup;
    }

    /**
     * Create colorful flowers scattered around the playground
     */
    createFlowers() {
        const flowerColors = [0xff69b4, 0xffff00, 0xff4500, 0x9370db, 0xff1493];
        const flowerPositions = [
            { x: -8, z: -8 }, { x: -6, z: -9 }, { x: -7, z: -7 },
            { x: 8, z: -8 }, { x: 6, z: -9 }, { x: 7, z: -7 },
            { x: -10, z: 8 }, { x: -8, z: 9 }, { x: -9, z: 7 },
            { x: 10, z: 8 }, { x: 8, z: 9 }, { x: 9, z: 7 },
            { x: 0, z: -12 }, { x: 1, z: -11 }, { x: -1, z: -13 }
        ];

        flowerPositions.forEach((pos, index) => {
            const flower = this.createFlower(
                pos.x,
                pos.z,
                flowerColors[index % flowerColors.length]
            );
            flower.userData = {
                name: `flower-${index}`,
                type: 'flower',
                interactive: true,
                originalScale: flower.scale.clone(),
                description: 'A cheerful flower brightening up the garden.'
            };
            this.interactiveObjects.push(flower);
        });
    }

    /**
     * Create a single flower with stem and petals
     */
    createFlower(x, z, color) {
        const flowerGroup = new THREE.Group();

        // Stem
        const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 6);
        const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.3;
        flowerGroup.add(stem);

        // Petals (5 small spheres arranged in a circle) with toon shading
        const petalGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const petalMaterial = this.createToonMaterial(color);

        for (let i = 0; i < 5; i++) {
            const petal = new THREE.Mesh(petalGeometry, petalMaterial);
            const angle = (i / 5) * Math.PI * 2;
            petal.position.set(
                Math.cos(angle) * 0.15,
                0.6,
                Math.sin(angle) * 0.15
            );
            flowerGroup.add(petal);
        }

        // Center
        const centerGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const centerMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.y = 0.6;
        flowerGroup.add(center);

        flowerGroup.position.set(x, 0, z);
        this.scene.add(flowerGroup);

        return flowerGroup;
    }

    /**
     * Create the sandbox area
     */
    createSandbox() {
        const sandboxGroup = new THREE.Group();

        // Sandbox base with realistic sand texture
        const boxGeometry = new THREE.BoxGeometry(4, 0.3, 4);
        const boxMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.sand,
            normalMap: this.textures.sandNormal,
            normalScale: new THREE.Vector2(0.2, 0.2),
            roughness: 0.95,
            metalness: 0.0,
            color: 0xf4a460
        });
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.y = 0.15;
        box.castShadow = true;
        box.receiveShadow = true;
        sandboxGroup.add(box);

        // Sandbox borders with wood texture
        const borderGeometry = new THREE.BoxGeometry(4.4, 0.2, 0.3);
        const borderMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.wood,
            normalMap: this.textures.woodNormal,
            normalScale: new THREE.Vector2(0.3, 0.3),
            roughness: 0.85,
            metalness: 0.0,
            color: 0x8b4513
        });

        const border1 = new THREE.Mesh(borderGeometry, borderMaterial);
        border1.position.set(0, 0.25, 2.05);
        border1.castShadow = true;
        sandboxGroup.add(border1);

        const border2 = new THREE.Mesh(borderGeometry, borderMaterial);
        border2.position.set(0, 0.25, -2.05);
        border2.castShadow = true;
        sandboxGroup.add(border2);

        const border3 = new THREE.Mesh(borderGeometry, borderMaterial);
        border3.position.set(2.05, 0.25, 0);
        border3.rotation.y = Math.PI / 2;
        border3.castShadow = true;
        sandboxGroup.add(border3);

        const border4 = new THREE.Mesh(borderGeometry, borderMaterial);
        border4.position.set(-2.05, 0.25, 0);
        border4.rotation.y = Math.PI / 2;
        border4.castShadow = true;
        sandboxGroup.add(border4);

        sandboxGroup.position.set(-8, 0, 0);
        sandboxGroup.userData = {
            name: 'sandbox',
            type: 'sandbox',
            interactive: true,
            description: 'A cozy sandbox where imagination comes to life. Perfect for building castles and creating sandy adventures!'
        };
        this.scene.add(sandboxGroup);
        this.interactiveObjects.push(sandboxGroup);
    }

    /**
     * Create the swing set
     */
    createSwingSet() {
        const swingGroup = new THREE.Group();

        // Frame posts with realistic metal material
        const postGeometry = new THREE.CylinderGeometry(0.15, 0.15, 4, 16);
        const postMaterial = new THREE.MeshStandardMaterial({
            color: 0xd0d0d0,
            metalness: 0.85,
            roughness: 0.25,
            envMapIntensity: 1.0
        });

        const post1 = new THREE.Mesh(postGeometry, postMaterial);
        post1.position.set(-2, 2, 0);
        post1.castShadow = true;
        swingGroup.add(post1);

        const post2 = new THREE.Mesh(postGeometry, postMaterial);
        post2.position.set(2, 2, 0);
        post2.castShadow = true;
        swingGroup.add(post2);

        // Top bar
        const barGeometry = new THREE.CylinderGeometry(0.12, 0.12, 4.5, 8);
        const topBar = new THREE.Mesh(barGeometry, postMaterial);
        topBar.position.set(0, 4, 0);
        topBar.rotation.z = Math.PI / 2;
        topBar.castShadow = true;
        swingGroup.add(topBar);

        // Swing seat
        const seatGeometry = new THREE.BoxGeometry(1, 0.1, 0.8);
        const seatMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6347, // Tomato red
            roughness: 0.6
        });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.set(0, 1.5, 0);
        seat.castShadow = true;
        swingGroup.add(seat);

        // Chains (simplified as thin cylinders)
        const chainGeometry = new THREE.CylinderGeometry(0.03, 0.03, 2.5, 6);
        const chainMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080,
            metalness: 0.8,
            roughness: 0.3
        });

        const chain1 = new THREE.Mesh(chainGeometry, chainMaterial);
        chain1.position.set(-0.4, 2.75, 0.3);
        swingGroup.add(chain1);

        const chain2 = new THREE.Mesh(chainGeometry, chainMaterial);
        chain2.position.set(0.4, 2.75, 0.3);
        swingGroup.add(chain2);

        const chain3 = new THREE.Mesh(chainGeometry, chainMaterial);
        chain3.position.set(-0.4, 2.75, -0.3);
        swingGroup.add(chain3);

        const chain4 = new THREE.Mesh(chainGeometry, chainMaterial);
        chain4.position.set(0.4, 2.75, -0.3);
        swingGroup.add(chain4);

        swingGroup.position.set(6, 0, -5);
        swingGroup.userData = {
            name: 'swing',
            type: 'swing',
            interactive: true,
            swingSeat: seat,
            chains: [chain1, chain2, chain3, chain4],
            description: 'A fun swing that takes you high into the sky! Click to see it in action.'
        };
        this.scene.add(swingGroup);
        this.interactiveObjects.push(swingGroup);
    }

    /**
     * Create the slide
     */
    createSlide() {
        const slideGroup = new THREE.Group();

        // Slide platform
        const platformGeometry = new THREE.BoxGeometry(2, 0.2, 2);
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: 0x4169e1, // Royal blue
            roughness: 0.5
        });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.set(0, 2.5, -1);
        platform.castShadow = true;
        slideGroup.add(platform);

        // Ladder steps
        const stepGeometry = new THREE.BoxGeometry(1, 0.1, 0.3);
        const stepMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700, // Gold
            roughness: 0.6
        });

        for (let i = 0; i < 5; i++) {
            const step = new THREE.Mesh(stepGeometry, stepMaterial);
            step.position.set(0, 0.5 + i * 0.5, -2 - i * 0.1);
            step.castShadow = true;
            slideGroup.add(step);
        }

        // Slide surface with enhanced material
        const slideGeometry = new THREE.BoxGeometry(1.5, 0.2, 4);
        const slideMaterial = new THREE.MeshStandardMaterial({
            color: 0xff1493, // Deep pink
            roughness: 0.3,
            metalness: 0.4,
            emissive: 0xff1493,
            emissiveIntensity: 0.0 // Will increase on hover
        });
        const slideBoard = new THREE.Mesh(slideGeometry, slideMaterial);
        slideBoard.position.set(0, 1.3, 1);
        slideBoard.rotation.x = -0.5;
        slideBoard.castShadow = true;
        slideGroup.add(slideBoard);

        // Side rails
        const railGeometry = new THREE.BoxGeometry(0.1, 0.5, 4);
        const railMaterial = new THREE.MeshStandardMaterial({
            color: 0xff69b4,
            roughness: 0.6
        });

        const rail1 = new THREE.Mesh(railGeometry, railMaterial);
        rail1.position.set(0.7, 1.5, 1);
        rail1.rotation.x = -0.5;
        rail1.castShadow = true;
        slideGroup.add(rail1);

        const rail2 = new THREE.Mesh(railGeometry, railMaterial);
        rail2.position.set(-0.7, 1.5, 1);
        rail2.rotation.x = -0.5;
        rail2.castShadow = true;
        slideGroup.add(rail2);

        slideGroup.position.set(6, 0, 5);
        slideGroup.userData = {
            name: 'slide',
            type: 'slide',
            interactive: true,
            slideBoard: slideBoard,
            slideMaterial: slideMaterial,
            description: 'A colorful slide for endless fun! Whoosh down and feel the joy of playground adventures.'
        };
        this.scene.add(slideGroup);
        this.interactiveObjects.push(slideGroup);
    }

    /**
     * Create benches for sitting
     */
    createBenches() {
        const benchPositions = [
            { x: -5, z: -10, rotation: 0 },
            { x: 5, z: 10, rotation: Math.PI }
        ];

        benchPositions.forEach((pos, index) => {
            const bench = this.createBench();
            bench.position.set(pos.x, 0, pos.z);
            bench.rotation.y = pos.rotation;
            bench.userData = {
                name: `bench-${index}`,
                type: 'bench',
                interactive: true,
                description: 'A peaceful bench to rest and enjoy the playground scenery.'
            };
            this.interactiveObjects.push(bench);
        });
    }

    /**
     * Create a single bench
     */
    createBench() {
        const benchGroup = new THREE.Group();

        // Seat with realistic wood texture
        const seatGeometry = new THREE.BoxGeometry(2, 0.2, 0.8);
        const woodMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.wood,
            normalMap: this.textures.woodNormal,
            normalScale: new THREE.Vector2(0.4, 0.4),
            roughness: 0.85,
            metalness: 0.0,
            color: 0xd2691e
        });
        const seat = new THREE.Mesh(seatGeometry, woodMaterial);
        seat.position.y = 0.5;
        seat.castShadow = true;
        benchGroup.add(seat);

        // Backrest
        const backrestGeometry = new THREE.BoxGeometry(2, 0.8, 0.1);
        const backrest = new THREE.Mesh(backrestGeometry, woodMaterial);
        backrest.position.set(0, 0.9, -0.35);
        backrest.castShadow = true;
        benchGroup.add(backrest);

        // Legs with realistic metal material
        const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 12);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x696969,
            metalness: 0.8,
            roughness: 0.3
        });

        const positions = [
            { x: -0.8, z: 0.3 },
            { x: 0.8, z: 0.3 },
            { x: -0.8, z: -0.3 },
            { x: 0.8, z: -0.3 }
        ];

        positions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(pos.x, 0.25, pos.z);
            leg.castShadow = true;
            benchGroup.add(leg);
        });

        this.scene.add(benchGroup);
        return benchGroup;
    }

    /**
     * Create a winding path through the playground
     */
    createPath() {
        const pathMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.concrete,
            normalMap: this.textures.concreteNormal,
            normalScale: new THREE.Vector2(0.3, 0.3),
            roughness: 0.85,
            metalness: 0.0,
            color: 0xd3d3d3
        });

        // Create path segments in a winding pattern
        const pathSegments = [
            { x: 0, z: -8, width: 1.5, length: 4, rotation: 0 },
            { x: 1, z: -5, width: 1.5, length: 3, rotation: 0.3 },
            { x: 2, z: -2, width: 1.5, length: 3, rotation: 0 },
            { x: 2, z: 1, width: 1.5, length: 3, rotation: -0.2 },
            { x: 1, z: 4, width: 1.5, length: 3, rotation: 0 },
            { x: 0, z: 7, width: 1.5, length: 3, rotation: 0.2 }
        ];

        pathSegments.forEach(segment => {
            const segmentGeometry = new THREE.BoxGeometry(segment.width, 0.05, segment.length);
            const pathPiece = new THREE.Mesh(segmentGeometry, pathMaterial);
            pathPiece.position.set(segment.x, 0.03, segment.z);
            pathPiece.rotation.y = segment.rotation;
            pathPiece.receiveShadow = true;
            this.scene.add(pathPiece);
        });
    }

    /**
     * Create decorative lamps
     */
    createLamps() {
        const lampPositions = [
            { x: -12, z: -12 },
            { x: 12, z: -12 },
            { x: -12, z: 12 },
            { x: 12, z: 12 }
        ];

        lampPositions.forEach((pos, index) => {
            const lamp = this.createLamp(pos.x, pos.z);
            lamp.userData = {
                name: `lamp-${index}`,
                type: 'lamp',
                interactive: true,
                isOn: false,
                description: 'A magical lamp that lights up with a warm glow. Click to toggle!'
            };
            this.interactiveObjects.push(lamp);
        });
    }

    /**
     * Create a single lamp post with light
     */
    createLamp(x, z) {
        const lampGroup = new THREE.Group();

        // Pole with realistic metal material
        const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 16);
        const poleMaterial = new THREE.MeshStandardMaterial({
            color: 0x2f4f4f,
            metalness: 0.85,
            roughness: 0.25,
            envMapIntensity: 1.0
        });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 1.5;
        pole.castShadow = true;
        lampGroup.add(pole);

        // Lamp head
        const lampGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const lampMaterial = new THREE.MeshStandardMaterial({
            color: 0xfff8dc,
            emissive: 0x000000,
            emissiveIntensity: 0,
            roughness: 0.3,
            transparent: true,
            opacity: 0.9
        });
        const lampHead = new THREE.Mesh(lampGeometry, lampMaterial);
        lampHead.position.y = 3.2;
        lampGroup.add(lampHead);

        // Point light (initially off)
        const pointLight = new THREE.PointLight(0xffa500, 0, 8);
        pointLight.position.y = 3.2;
        lampGroup.add(pointLight);

        lampGroup.position.set(x, 0, z);
        lampGroup.userData.lampHead = lampHead;
        lampGroup.userData.lampMaterial = lampMaterial;
        lampGroup.userData.pointLight = pointLight;

        this.scene.add(lampGroup);
        return lampGroup;
    }

    /**
     * Create a gradient sky using a sky sphere
     */
    createSky() {
        const skyGeometry = new THREE.SphereGeometry(150, 32, 32);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x0077ff) },
                bottomColor: { value: new THREE.Color(0xffffff) },
                offset: { value: 33 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
    }

    /**
     * Get the renderer instance
     */
    getRenderer() {
        return this.renderer;
    }

    /**
     * Get the camera instance
     */
    getCamera() {
        return this.camera;
    }

    /**
     * Get the scene instance
     */
    getScene() {
        return this.scene;
    }

    /**
     * Get the controls instance
     */
    getControls() {
        return this.controls;
    }

    /**
     * Create toon/cel shaded material for objects
     */
    createToonMaterial(color, roughness = 0.7) {
        // Using MeshToonMaterial for cel-shading effect
        const material = new THREE.MeshToonMaterial({
            color: color,
            gradientMap: this.createGradientMap()
        });
        return material;
    }

    /**
     * Create gradient map for toon shading
     */
    createGradientMap() {
        // Create a simple 3-tone gradient for toon shading
        const colors = new Uint8Array(3);
        colors[0] = 80;   // Dark
        colors[1] = 180;  // Mid
        colors[2] = 255;  // Light

        const gradientMap = new THREE.DataTexture(colors, colors.length, 1, THREE.RedFormat);
        gradientMap.needsUpdate = true;
        gradientMap.magFilter = THREE.NearestFilter;
        gradientMap.minFilter = THREE.NearestFilter;

        return gradientMap;
    }

    /**
     * Create animated grass blades using instanced meshes
     */
    createAnimatedGrassBlades() {
        const grassCount = 2000;
        const bladeGeometry = new THREE.PlaneGeometry(0.1, 0.6, 1, 3);

        // Custom shader for grass blades
        const bladeMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uWindStrength: { value: this.windStrength }
            },
            vertexShader: `
                uniform float uTime;
                uniform float uWindStrength;
                attribute vec3 instancePosition;
                attribute float instanceOffset;
                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    vec3 pos = position;

                    // Wind sway based on height
                    float heightFactor = uv.y;
                    float windWave = sin(uTime * 3.0 + instancePosition.x + instanceOffset) *
                                    cos(uTime * 2.0 + instancePosition.z + instanceOffset);
                    pos.x += windWave * uWindStrength * heightFactor * 0.2;
                    pos.z += sin(uTime * 2.5 + instanceOffset) * uWindStrength * heightFactor * 0.1;

                    vec4 modelPosition = modelMatrix * vec4(pos + instancePosition, 1.0);
                    gl_Position = projectionMatrix * viewMatrix * modelPosition;
                }
            `,
            fragmentShader: `
                varying vec2 vUv;

                void main() {
                    vec3 grassColor = mix(vec3(0.29, 0.58, 0.28), vec3(0.42, 0.75, 0.35), vUv.y);
                    gl_FragColor = vec4(grassColor, 1.0);
                }
            `,
            side: THREE.DoubleSide
        });

        const instancedMesh = new THREE.InstancedMesh(bladeGeometry, bladeMaterial, grassCount);
        const dummy = new THREE.Object3D();
        const positions = new Float32Array(grassCount * 3);
        const offsets = new Float32Array(grassCount);

        for (let i = 0; i < grassCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.sqrt(Math.random()) * 45;
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;

            positions[i * 3] = x;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = z;
            offsets[i] = Math.random() * Math.PI * 2;

            dummy.position.set(x, 0, z);
            dummy.rotation.y = Math.random() * Math.PI * 2;
            dummy.scale.set(
                0.8 + Math.random() * 0.4,
                0.8 + Math.random() * 0.6,
                1
            );
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(i, dummy.matrix);
        }

        bladeGeometry.setAttribute('instancePosition', new THREE.InstancedBufferAttribute(positions, 3));
        bladeGeometry.setAttribute('instanceOffset', new THREE.InstancedBufferAttribute(offsets, 1));

        this.scene.add(instancedMesh);
        this.grassBlades.push({ mesh: instancedMesh, material: bladeMaterial });
    }

    /**
     * Create scattered rocks
     */
    createRocks() {
        const rockPositions = [
            { x: -10, z: -3 }, { x: 12, z: -7 }, { x: -14, z: 5 },
            { x: 10, z: 8 }, { x: -5, z: -15 }, { x: 15, z: -10 },
            { x: -8, z: 12 }, { x: 5, z: -12 }, { x: -16, z: -8 }
        ];

        rockPositions.forEach((pos, index) => {
            const rockGroup = new THREE.Group();

            // Create irregular rock shape with realistic stone texture
            const rockGeometry = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.4, 0);
            const rockMaterial = new THREE.MeshStandardMaterial({
                map: this.textures.stone,
                normalMap: this.textures.stoneNormal,
                normalScale: new THREE.Vector2(0.5, 0.5),
                roughness: 0.9,
                metalness: 0.0,
                color: 0x808080,
                flatShading: true
            });

            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.y = 0.2;
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.scale.set(
                0.8 + Math.random() * 0.5,
                0.6 + Math.random() * 0.4,
                0.8 + Math.random() * 0.5
            );
            rock.castShadow = true;
            rockGroup.add(rock);

            rockGroup.position.set(pos.x, 0, pos.z);
            this.scene.add(rockGroup);
        });
    }

    /**
     * Create bushes with animated leaves
     */
    createBushes() {
        const bushPositions = [
            { x: -12, z: -8 }, { x: 14, z: -5 }, { x: -10, z: 10 },
            { x: 12, z: 9 }, { x: -15, z: 0 }, { x: 16, z: 3 }
        ];

        bushPositions.forEach(pos => {
            const bushGroup = new THREE.Group();

            // Multiple spheres for bush shape
            for (let i = 0; i < 3; i++) {
                const bushGeometry = new THREE.SphereGeometry(0.5 + Math.random() * 0.3, 8, 8);
                const bushMaterial = new THREE.MeshStandardMaterial({
                    color: 0x3a7a3a,
                    roughness: 0.8
                });

                const sphere = new THREE.Mesh(bushGeometry, bushMaterial);
                sphere.position.set(
                    (Math.random() - 0.5) * 0.8,
                    0.3 + Math.random() * 0.4,
                    (Math.random() - 0.5) * 0.8
                );
                sphere.castShadow = true;
                bushGroup.add(sphere);
            }

            bushGroup.position.set(pos.x, 0, pos.z);
            this.scene.add(bushGroup);
        });
    }

    /**
     * Create whimsical mushrooms
     */
    createMushrooms() {
        const mushroomPositions = [
            { x: -6, z: -5 }, { x: 8, z: -4 }, { x: -11, z: 7 },
            { x: 9, z: 6 }, { x: -3, z: 10 }, { x: 4, z: -8 }
        ];

        mushroomPositions.forEach(pos => {
            const mushroomGroup = new THREE.Group();

            // Stem
            const stemGeometry = new THREE.CylinderGeometry(0.1, 0.08, 0.4, 8);
            const stemMaterial = new THREE.MeshStandardMaterial({
                color: 0xf5f5dc,
                roughness: 0.7
            });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.y = 0.2;
            stem.castShadow = true;
            mushroomGroup.add(stem);

            // Cap
            const capGeometry = new THREE.SphereGeometry(0.25, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
            const capMaterial = new THREE.MeshStandardMaterial({
                color: 0xff6347,
                roughness: 0.6
            });
            const cap = new THREE.Mesh(capGeometry, capMaterial);
            cap.position.y = 0.4;
            cap.castShadow = true;
            mushroomGroup.add(cap);

            // White spots
            for (let i = 0; i < 3; i++) {
                const spotGeometry = new THREE.SphereGeometry(0.05, 6, 6);
                const spotMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
                const spot = new THREE.Mesh(spotGeometry, spotMaterial);
                const angle = (i / 3) * Math.PI * 2;
                spot.position.set(
                    Math.cos(angle) * 0.15,
                    0.45,
                    Math.sin(angle) * 0.15
                );
                mushroomGroup.add(spot);
            }

            mushroomGroup.position.set(pos.x, 0, pos.z);
            this.scene.add(mushroomGroup);
        });
    }

    /**
     * Create animated clouds
     */
    createClouds() {
        for (let i = 0; i < 8; i++) {
            const cloudGroup = new THREE.Group();
            const cloudMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.8,
                roughness: 1
            });

            // Create cloud from multiple spheres
            for (let j = 0; j < 5; j++) {
                const cloudGeometry = new THREE.SphereGeometry(1 + Math.random() * 0.5, 8, 8);
                const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);
                cloudPart.position.set(
                    (j - 2) * 1.5 + (Math.random() - 0.5),
                    (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 0.5
                );
                cloudPart.scale.set(
                    1 + Math.random() * 0.3,
                    0.7 + Math.random() * 0.3,
                    0.8 + Math.random() * 0.3
                );
                cloudGroup.add(cloudPart);
            }

            cloudGroup.position.set(
                (Math.random() - 0.5) * 100,
                20 + Math.random() * 15,
                (Math.random() - 0.5) * 100
            );
            cloudGroup.scale.set(2, 1.5, 2);

            this.scene.add(cloudGroup);
            this.clouds.push({
                mesh: cloudGroup,
                speed: 0.5 + Math.random() * 1.0,
                offset: Math.random() * Math.PI * 2
            });
        }
    }

    /**
     * Create animated butterflies
     */
    createButterflies() {
        for (let i = 0; i < 6; i++) {
            const butterflyGroup = new THREE.Group();

            // Body
            const bodyGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.2, 6);
            const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            butterflyGroup.add(body);

            // Wings
            const wingColors = [0xff69b4, 0xffd700, 0xff6347, 0x9370db];
            const wingColor = wingColors[i % wingColors.length];
            const wingGeometry = new THREE.CircleGeometry(0.15, 8);
            const wingMaterial = new THREE.MeshStandardMaterial({
                color: wingColor,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9
            });

            const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
            leftWing.position.set(-0.1, 0, 0);
            leftWing.rotation.y = Math.PI / 4;
            butterflyGroup.add(leftWing);

            const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
            rightWing.position.set(0.1, 0, 0);
            rightWing.rotation.y = -Math.PI / 4;
            butterflyGroup.add(rightWing);

            // Starting position
            const angle = (i / 6) * Math.PI * 2;
            const radius = 15 + Math.random() * 10;
            butterflyGroup.position.set(
                Math.cos(angle) * radius,
                1 + Math.random() * 2,
                Math.sin(angle) * radius
            );

            this.scene.add(butterflyGroup);
            this.butterflies.push({
                mesh: butterflyGroup,
                leftWing: leftWing,
                rightWing: rightWing,
                speed: 0.5 + Math.random() * 0.5,
                radius: radius,
                angle: angle,
                heightOffset: Math.random() * Math.PI * 2,
                pathOffset: Math.random() * Math.PI * 2
            });
        }
    }

    /**
     * Create flying birds
     */
    createBirds() {
        for (let i = 0; i < 4; i++) {
            const birdGroup = new THREE.Group();

            // Simple bird shape (V-shape)
            const birdGeometry = new THREE.ConeGeometry(0.1, 0.3, 3);
            const birdMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
            const body = new THREE.Mesh(birdGeometry, birdMaterial);
            body.rotation.x = Math.PI / 2;
            birdGroup.add(body);

            // Wings
            const wingGeometry = new THREE.PlaneGeometry(0.4, 0.15);
            const wingMaterial = new THREE.MeshStandardMaterial({
                color: 0x444444,
                side: THREE.DoubleSide
            });

            const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
            leftWing.position.set(-0.15, 0, 0);
            birdGroup.add(leftWing);

            const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
            rightWing.position.set(0.15, 0, 0);
            birdGroup.add(rightWing);

            birdGroup.position.set(
                (Math.random() - 0.5) * 60,
                15 + Math.random() * 10,
                (Math.random() - 0.5) * 60
            );

            this.scene.add(birdGroup);
            this.birds.push({
                mesh: birdGroup,
                leftWing: leftWing,
                rightWing: rightWing,
                speed: 2 + Math.random() * 1.5,
                direction: new THREE.Vector3(
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 0.2,
                    (Math.random() - 0.5) * 2
                ).normalize(),
                wingPhase: Math.random() * Math.PI * 2
            });
        }
    }

    /**
     * Create falling leaves particle system
     */
    createFallingLeaves() {
        const leafCount = 30;

        for (let i = 0; i < leafCount; i++) {
            const leafGeometry = new THREE.PlaneGeometry(0.15, 0.2);
            const leafColors = [0xffa500, 0xff8c00, 0xff4500, 0xdaa520];
            const leafMaterial = new THREE.MeshStandardMaterial({
                color: leafColors[Math.floor(Math.random() * leafColors.length)],
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9
            });

            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            leaf.position.set(
                (Math.random() - 0.5) * 40,
                5 + Math.random() * 15,
                (Math.random() - 0.5) * 40
            );
            leaf.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            this.scene.add(leaf);
            this.leaves.push({
                mesh: leaf,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    -0.02 - Math.random() * 0.02,
                    (Math.random() - 0.5) * 0.02
                ),
                rotationSpeed: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.05,
                    (Math.random() - 0.5) * 0.05,
                    (Math.random() - 0.5) * 0.1
                ),
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    /**
     * Create a cozy mini house with one room
     */
    createMiniHouse() {
        const houseGroup = new THREE.Group();

        // Foundation (stone base)
        const foundationGeometry = new THREE.BoxGeometry(6, 0.3, 5);
        const foundationMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.stone,
            normalMap: this.textures.stoneNormal,
            normalScale: new THREE.Vector2(0.4, 0.4),
            roughness: 0.9,
            metalness: 0.0,
            color: 0x999999
        });
        const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
        foundation.position.y = 0.15;
        foundation.receiveShadow = true;
        foundation.castShadow = true;
        houseGroup.add(foundation);

        // Floor (wood planks)
        const floorGeometry = new THREE.BoxGeometry(5.5, 0.2, 4.5);
        const floorMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.wood,
            normalMap: this.textures.woodNormal,
            normalScale: new THREE.Vector2(0.5, 0.5),
            roughness: 0.8,
            metalness: 0.0,
            color: 0xc19a6b
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.y = 0.4;
        floor.receiveShadow = true;
        houseGroup.add(floor);

        // Walls (4 walls with wood texture)
        const wallHeight = 3;
        const wallThickness = 0.2;

        // Front wall (with door opening)
        const frontWallLeft = new THREE.BoxGeometry(1.5, wallHeight, wallThickness);
        const wallMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.wood,
            normalMap: this.textures.woodNormal,
            normalScale: new THREE.Vector2(0.3, 0.3),
            roughness: 0.85,
            metalness: 0.0,
            color: 0xa0826d
        });

        const leftWall = new THREE.Mesh(frontWallLeft, wallMaterial);
        leftWall.position.set(-2, wallHeight / 2 + 0.5, 2.25);
        leftWall.castShadow = true;
        leftWall.receiveShadow = true;
        houseGroup.add(leftWall);

        const rightWall = new THREE.Mesh(frontWallLeft, wallMaterial);
        rightWall.position.set(2, wallHeight / 2 + 0.5, 2.25);
        rightWall.castShadow = true;
        rightWall.receiveShadow = true;
        houseGroup.add(rightWall);

        // Top part above door
        const topWall = new THREE.BoxGeometry(2, 1, wallThickness);
        const topPart = new THREE.Mesh(topWall, wallMaterial);
        topPart.position.set(0, 2.5 + 0.5, 2.25);
        topPart.castShadow = true;
        topPart.receiveShadow = true;
        houseGroup.add(topPart);

        // Back wall (with window)
        const backWallLeft = new THREE.BoxGeometry(2, wallHeight, wallThickness);
        const backLeft = new THREE.Mesh(backWallLeft, wallMaterial);
        backLeft.position.set(-1.5, wallHeight / 2 + 0.5, -2.25);
        backLeft.castShadow = true;
        backLeft.receiveShadow = true;
        houseGroup.add(backLeft);

        const backRight = new THREE.Mesh(backWallLeft, wallMaterial);
        backRight.position.set(1.5, wallHeight / 2 + 0.5, -2.25);
        backRight.castShadow = true;
        backRight.receiveShadow = true;
        houseGroup.add(backRight);

        const backTop = new THREE.BoxGeometry(1, 1.2, wallThickness);
        const backTopPart = new THREE.Mesh(backTop, wallMaterial);
        backTopPart.position.set(0, 2.4 + 0.5, -2.25);
        backTopPart.castShadow = true;
        backTopPart.receiveShadow = true;
        houseGroup.add(backTopPart);

        const backBottom = new THREE.BoxGeometry(1, 0.8, wallThickness);
        const backBottomPart = new THREE.Mesh(backBottom, wallMaterial);
        backBottomPart.position.set(0, 0.9, -2.25);
        backBottomPart.castShadow = true;
        backBottomPart.receiveShadow = true;
        houseGroup.add(backBottomPart);

        // Side walls
        const sideWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, 4.5);
        const sideLeft = new THREE.Mesh(sideWallGeometry, wallMaterial);
        sideLeft.position.set(-2.75, wallHeight / 2 + 0.5, 0);
        sideLeft.castShadow = true;
        sideLeft.receiveShadow = true;
        houseGroup.add(sideLeft);

        const sideRight = new THREE.Mesh(sideWallGeometry, wallMaterial);
        sideRight.position.set(2.75, wallHeight / 2 + 0.5, 0);
        sideRight.castShadow = true;
        sideRight.receiveShadow = true;
        houseGroup.add(sideRight);

        // Door (wooden door)
        const doorGeometry = new THREE.BoxGeometry(1.8, 2.2, 0.1);
        const doorMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.darkWood,
            normalMap: this.textures.woodNormal,
            normalScale: new THREE.Vector2(0.4, 0.4),
            roughness: 0.7,
            metalness: 0.0,
            color: 0x654321
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 1.6, 2.35);
        door.castShadow = true;
        houseGroup.add(door);

        // Door handle (metallic)
        const handleGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.9,
            roughness: 0.2
        });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(0.7, 1.6, 2.45);
        handle.castShadow = true;
        houseGroup.add(handle);

        // Window (back wall)
        const windowFrameGeometry = new THREE.BoxGeometry(1.2, 1.4, 0.15);
        const windowFrameMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.wood,
            color: 0x8b7355,
            roughness: 0.6
        });
        const windowFrame = new THREE.Mesh(windowFrameGeometry, windowFrameMaterial);
        windowFrame.position.set(0, 1.8, -2.28);
        windowFrame.castShadow = true;
        houseGroup.add(windowFrame);

        // Window panes (glass effect)
        const windowGlassGeometry = new THREE.PlaneGeometry(1, 1.2);
        const windowGlassMaterial = new THREE.MeshStandardMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.3,
            metalness: 0.9,
            roughness: 0.1
        });
        const windowGlass = new THREE.Mesh(windowGlassGeometry, windowGlassMaterial);
        windowGlass.position.set(0, 1.8, -2.35);
        houseGroup.add(windowGlass);

        // Roof (pitched roof)
        const roofGeometry = new THREE.ConeGeometry(4.2, 2, 4);
        const roofMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.9,
            metalness: 0.0
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(0, wallHeight + 1.5, 0);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        houseGroup.add(roof);

        // Chimney
        const chimneyGeometry = new THREE.BoxGeometry(0.5, 1.5, 0.5);
        const chimneyMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.stone,
            normalMap: this.textures.stoneNormal,
            color: 0x8b0000,
            roughness: 0.8
        });
        const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
        chimney.position.set(1.5, wallHeight + 1.8, -1);
        chimney.castShadow = true;
        houseGroup.add(chimney);

        // Interior - Simple table
        const tableTopGeometry = new THREE.BoxGeometry(1.5, 0.1, 1);
        const tableMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.wood,
            color: 0xa0826d,
            roughness: 0.7
        });
        const tableTop = new THREE.Mesh(tableTopGeometry, tableMaterial);
        tableTop.position.set(-1, 1.2, 0);
        tableTop.castShadow = true;
        tableTop.receiveShadow = true;
        houseGroup.add(tableTop);

        // Table legs
        const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
        const legPositions = [
            { x: -1.6, z: 0.4 },
            { x: -1.6, z: -0.4 },
            { x: -0.4, z: 0.4 },
            { x: -0.4, z: -0.4 }
        ];

        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, tableMaterial);
            leg.position.set(pos.x, 0.7, pos.z);
            leg.castShadow = true;
            houseGroup.add(leg);
        });

        // Chair
        const chairSeatGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.5);
        const chairSeat = new THREE.Mesh(chairSeatGeometry, tableMaterial);
        chairSeat.position.set(-1, 0.9, -0.8);
        chairSeat.castShadow = true;
        houseGroup.add(chairSeat);

        const chairBackGeometry = new THREE.BoxGeometry(0.5, 0.6, 0.1);
        const chairBack = new THREE.Mesh(chairBackGeometry, tableMaterial);
        chairBack.position.set(-1, 1.25, -1.05);
        chairBack.castShadow = true;
        houseGroup.add(chairBack);

        // Chair legs
        const chairLegGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6);
        const chairLegPositions = [
            { x: -1.2, z: -0.6 },
            { x: -1.2, z: -1.0 },
            { x: -0.8, z: -0.6 },
            { x: -0.8, z: -1.0 }
        ];

        chairLegPositions.forEach(pos => {
            const leg = new THREE.Mesh(chairLegGeometry, tableMaterial);
            leg.position.set(pos.x, 0.5, pos.z);
            leg.castShadow = true;
            houseGroup.add(leg);
        });

        // Bed
        const bedFrameGeometry = new THREE.BoxGeometry(2, 0.3, 1.5);
        const bedFrameMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.darkWood,
            color: 0x654321,
            roughness: 0.8
        });
        const bedFrame = new THREE.Mesh(bedFrameGeometry, bedFrameMaterial);
        bedFrame.position.set(1.5, 0.65, -1);
        bedFrame.castShadow = true;
        houseGroup.add(bedFrame);

        // Mattress
        const mattressGeometry = new THREE.BoxGeometry(1.8, 0.3, 1.3);
        const mattressMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6b9d,
            roughness: 0.9
        });
        const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
        mattress.position.set(1.5, 0.95, -1);
        mattress.castShadow = true;
        mattress.receiveShadow = true;
        houseGroup.add(mattress);

        // Pillow
        const pillowGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.4);
        const pillowMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.7
        });
        const pillow = new THREE.Mesh(pillowGeometry, pillowMaterial);
        pillow.position.set(1.5, 1.2, -1.4);
        pillow.rotation.x = 0.2;
        pillow.castShadow = true;
        houseGroup.add(pillow);

        // Small rug in front of door
        const rugGeometry = new THREE.PlaneGeometry(1.2, 0.8);
        const rugMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b0000,
            roughness: 1.0
        });
        const rug = new THREE.Mesh(rugGeometry, rugMaterial);
        rug.rotation.x = -Math.PI / 2;
        rug.position.set(0, 0.51, 1);
        rug.receiveShadow = true;
        houseGroup.add(rug);

        // Lantern on table (decorative)
        const lanternBaseGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.15, 8);
        const lanternMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.7,
            roughness: 0.3
        });
        const lanternBase = new THREE.Mesh(lanternBaseGeometry, lanternMaterial);
        lanternBase.position.set(-1, 1.35, 0);
        lanternBase.castShadow = true;
        houseGroup.add(lanternBase);

        const lanternGlowGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const lanternGlowMaterial = new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            emissive: 0xffaa00,
            emissiveIntensity: 0.5
        });
        const lanternGlow = new THREE.Mesh(lanternGlowGeometry, lanternGlowMaterial);
        lanternGlow.position.set(-1, 1.45, 0);
        houseGroup.add(lanternGlow);

        // Position the house in the playground
        houseGroup.position.set(-12, 0, 3);

        // Add to interactive objects
        houseGroup.userData = {
            name: 'mini-house',
            type: 'house',
            interactive: true,
            description: 'A cozy mini house with a bed, table, and warm lantern light. A perfect little home!'
        };

        this.scene.add(houseGroup);
        this.interactiveObjects.push(houseGroup);
    }

    /**
     * Create interactive kickable balls
     */
    createBalls() {
        // Create soccer ball texture procedurally
        const ballTexture = this.createSoccerBallTexture();

        // Ball 1 - Classic soccer ball near the playground area
        const ball1Geometry = new THREE.SphereGeometry(0.4, 32, 32);
        const ball1Material = new THREE.MeshStandardMaterial({
            map: ballTexture,
            roughness: 0.6,
            metalness: 0.1,
            color: 0xffffff
        });
        const ball1 = new THREE.Mesh(ball1Geometry, ball1Material);
        ball1.position.set(5, 0.4, 8);
        ball1.castShadow = true;
        ball1.receiveShadow = true;
        ball1.userData = {
            name: 'soccer-ball-1',
            type: 'ball',
            interactive: true,
            description: 'A colorful soccer ball - click to kick it!'
        };

        // Physics properties
        const ball1Physics = {
            mesh: ball1,
            velocity: new THREE.Vector3(0, 0, 0),
            friction: 0.92,
            gravity: -9.8,
            bounceY: 0,
            radius: 0.4,
            mass: 0.45 // Standard soccer ball mass in kg
        };
        this.balls.push(ball1Physics);
        this.scene.add(ball1);
        this.interactiveObjects.push(ball1);

        // Ball 2 - Colorful beach ball near the sandbox
        const ball2Geometry = new THREE.SphereGeometry(0.35, 32, 32);
        const ball2Material = new THREE.MeshStandardMaterial({
            color: 0xff6b6b,
            roughness: 0.4,
            metalness: 0.05
        });
        const ball2 = new THREE.Mesh(ball2Geometry, ball2Material);
        ball2.position.set(-5, 0.35, -8);
        ball2.castShadow = true;
        ball2.receiveShadow = true;
        ball2.userData = {
            name: 'beach-ball',
            type: 'ball',
            interactive: true,
            description: 'A bouncy beach ball - give it a kick!'
        };

        // Physics properties (lighter than soccer ball)
        const ball2Physics = {
            mesh: ball2,
            velocity: new THREE.Vector3(0, 0, 0),
            friction: 0.88,
            gravity: -9.8,
            bounceY: 0,
            radius: 0.35,
            mass: 0.15 // Beach balls are lighter
        };
        this.balls.push(ball2Physics);
        this.scene.add(ball2);
        this.interactiveObjects.push(ball2);
    }

    /**
     * Create a simple soccer ball texture pattern
     */
    createSoccerBallTexture() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // White base
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        // Black pentagon and hexagon pattern (simplified)
        ctx.fillStyle = '#000000';

        // Center pentagon
        this.drawPentagon(ctx, size / 2, size / 2, 60);

        // Surrounding hexagons
        const positions = [
            [size / 2, size / 2 - 100],
            [size / 2 + 87, size / 2 - 50],
            [size / 2 + 87, size / 2 + 50],
            [size / 2, size / 2 + 100],
            [size / 2 - 87, size / 2 + 50],
            [size / 2 - 87, size / 2 - 50]
        ];

        positions.forEach(([x, y]) => {
            this.drawPentagon(ctx, x, y, 40);
        });

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Helper to draw a pentagon on canvas
     */
    drawPentagon(ctx, x, y, radius) {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
            const px = x + radius * Math.cos(angle);
            const py = y + radius * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Kick a ball with physics
     */
    kickBall(ball, kickDirection) {
        // Find the ball physics object
        const ballPhysics = this.balls.find(b => b.mesh === ball);
        if (!ballPhysics) return;

        // Apply kick force based on direction and mass
        const kickStrength = 8.0;
        ballPhysics.velocity.set(
            kickDirection.x * kickStrength,
            2.0, // Small upward component
            kickDirection.z * kickStrength
        );
    }

    /**
     * Update ball physics
     */
    updateBalls(deltaTime) {
        this.balls.forEach(ball => {
            // Skip if ball is stationary
            if (ball.velocity.lengthSq() < 0.001) {
                ball.velocity.set(0, 0, 0);
                // Ensure ball stays on ground
                if (ball.mesh.position.y <= ball.radius) {
                    ball.mesh.position.y = ball.radius;
                }
                return;
            }

            // Apply gravity
            ball.velocity.y += ball.gravity * deltaTime;

            // Update position
            ball.mesh.position.x += ball.velocity.x * deltaTime;
            ball.mesh.position.y += ball.velocity.y * deltaTime;
            ball.mesh.position.z += ball.velocity.z * deltaTime;

            // Ground collision
            if (ball.mesh.position.y <= ball.radius) {
                ball.mesh.position.y = ball.radius;
                ball.velocity.y *= -0.5; // Bounce with damping

                // Stop small bounces
                if (Math.abs(ball.velocity.y) < 0.3) {
                    ball.velocity.y = 0;
                }
            }

            // Apply friction on ground
            if (ball.mesh.position.y <= ball.radius + 0.01) {
                ball.velocity.x *= ball.friction;
                ball.velocity.z *= ball.friction;
            }

            // Boundary constraints (keep ball in playground)
            const maxDistance = 45;
            if (Math.abs(ball.mesh.position.x) > maxDistance) {
                ball.mesh.position.x = Math.sign(ball.mesh.position.x) * maxDistance;
                ball.velocity.x *= -0.5;
            }
            if (Math.abs(ball.mesh.position.z) > maxDistance) {
                ball.mesh.position.z = Math.sign(ball.mesh.position.z) * maxDistance;
                ball.velocity.z *= -0.5;
            }

            // Rotate ball based on movement
            const speed = new THREE.Vector2(ball.velocity.x, ball.velocity.z).length();
            if (speed > 0.1) {
                const axis = new THREE.Vector3(-ball.velocity.z, 0, ball.velocity.x).normalize();
                ball.mesh.rotateOnWorldAxis(axis, speed * deltaTime * 2);
            }
        });
    }

    /**
     * Update method called every frame
     */
    update() {
        this.controls.update();
        this.updateAnimations();

        // Update shader uniforms for animations
        const elapsedTime = this.clock.getElapsedTime();
        const deltaTime = this.clock.getDelta();

        // Update wind system
        this.updateWind(elapsedTime);

        // Update living elements
        this.updateClouds(elapsedTime);
        this.updateButterflies(elapsedTime);
        this.updateBirds(elapsedTime);
        this.updateLeavesPhysics(elapsedTime);

        // Update ball physics
        this.updateBalls(deltaTime);
    }

    /**
     * Update wind-driven animations
     */
    updateWind(time) {
        // Update grass blades
        this.grassBlades.forEach(blade => {
            blade.material.uniforms.uTime.value = time;
        });

        // Update tree foliage
        this.treeFoliage.forEach(foliage => {
            foliage.material.uniforms.uTime.value = time;
        });
    }

    /**
     * Update cloud movement
     */
    updateClouds(time) {
        this.clouds.forEach(cloud => {
            cloud.mesh.position.x += this.windDirection.x * cloud.speed * 0.01;
            cloud.mesh.position.z += this.windDirection.y * cloud.speed * 0.01;

            // Wrap around
            if (cloud.mesh.position.x > 60) cloud.mesh.position.x = -60;
            if (cloud.mesh.position.z > 60) cloud.mesh.position.z = -60;
            if (cloud.mesh.position.x < -60) cloud.mesh.position.x = 60;
            if (cloud.mesh.position.z < -60) cloud.mesh.position.z = 60;

            // Subtle bobbing
            cloud.mesh.position.y += Math.sin(time * 0.5 + cloud.offset) * 0.002;
        });
    }

    /**
     * Update butterfly flight patterns
     */
    updateButterflies(time) {
        this.butterflies.forEach(butterfly => {
            // Circular flight path with vertical oscillation
            butterfly.angle += butterfly.speed * 0.01;
            butterfly.mesh.position.x = Math.cos(butterfly.angle + butterfly.pathOffset) * butterfly.radius;
            butterfly.mesh.position.z = Math.sin(butterfly.angle + butterfly.pathOffset) * butterfly.radius;
            butterfly.mesh.position.y = 1.5 + Math.sin(time * 2 + butterfly.heightOffset) * 1.5;

            // Wing flapping
            const flapAngle = Math.sin(time * 10) * 0.4;
            butterfly.leftWing.rotation.y = Math.PI / 4 + flapAngle;
            butterfly.rightWing.rotation.y = -Math.PI / 4 - flapAngle;

            // Face direction of movement
            butterfly.mesh.rotation.y = butterfly.angle + butterfly.pathOffset + Math.PI / 2;
        });
    }

    /**
     * Update bird flight
     */
    updateBirds(time) {
        this.birds.forEach(bird => {
            // Move in direction
            bird.mesh.position.add(bird.direction.clone().multiplyScalar(bird.speed * 0.02));

            // Wrap around world bounds
            if (Math.abs(bird.mesh.position.x) > 80) {
                bird.mesh.position.x *= -0.9;
                bird.direction.x *= -1;
            }
            if (Math.abs(bird.mesh.position.z) > 80) {
                bird.mesh.position.z *= -0.9;
                bird.direction.z *= -1;
            }

            // Wing flapping
            bird.wingPhase += 0.15;
            const flapAngle = Math.sin(bird.wingPhase) * 0.5;
            bird.leftWing.rotation.z = flapAngle;
            bird.rightWing.rotation.z = -flapAngle;

            // Face direction
            bird.mesh.lookAt(bird.mesh.position.clone().add(bird.direction));
        });
    }

    /**
     * Update falling leaves physics
     */
    updateLeavesPhysics(time) {
        this.leaves.forEach(leaf => {
            // Apply velocity
            leaf.mesh.position.add(leaf.velocity);

            // Add wind influence using simplex noise
            const windInfluence = this.noise3D(
                leaf.mesh.position.x * 0.1,
                leaf.mesh.position.y * 0.1,
                time * 0.5
            );
            leaf.mesh.position.x += windInfluence * 0.02;
            leaf.mesh.position.z += Math.sin(time + leaf.phase) * 0.01;

            // Rotate
            leaf.mesh.rotation.x += leaf.rotationSpeed.x;
            leaf.mesh.rotation.y += leaf.rotationSpeed.y;
            leaf.mesh.rotation.z += leaf.rotationSpeed.z;

            // Reset if too low
            if (leaf.mesh.position.y < 0) {
                leaf.mesh.position.y = 15 + Math.random() * 10;
                leaf.mesh.position.x = (Math.random() - 0.5) * 40;
                leaf.mesh.position.z = (Math.random() - 0.5) * 40;
            }
        });
    }

    /**
     * Update all active animations
     */
    updateAnimations() {
        const time = performance.now() * 0.001;

        this.animatingObjects.forEach((animData, object) => {
            if (animData.type === 'swing') {
                const swingAngle = Math.sin(time * 2) * 0.4;
                const seat = object.userData.swingSeat;
                const chains = object.userData.chains;

                if (seat) {
                    seat.rotation.z = swingAngle;
                    seat.position.x = Math.sin(swingAngle) * 0.5;
                }

                if (chains) {
                    chains.forEach(chain => {
                        chain.rotation.z = swingAngle;
                    });
                }
            }
        });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
