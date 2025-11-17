import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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

        this.init();
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
    }

    /**
     * Create lighting system with ambient and directional lights
     */
    createLighting() {
        // Ambient light for overall brightness
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun) with shadows
        const sunLight = new THREE.DirectionalLight(0xfffef0, 0.8);
        sunLight.position.set(30, 40, 20);
        sunLight.castShadow = true;
        sunLight.shadow.camera.left = -40;
        sunLight.shadow.camera.right = 40;
        sunLight.shadow.camera.top = 40;
        sunLight.shadow.camera.bottom = -40;
        sunLight.shadow.camera.near = 0.1;
        sunLight.shadow.camera.far = 100;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.bias = -0.001;
        this.scene.add(sunLight);
    }

    /**
     * Create the ground plane with grass texture
     */
    createGround() {
        const groundGeometry = new THREE.CircleGeometry(50, 64);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x5fb358, // Grass green
            roughness: 0.8,
            metalness: 0.0
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.userData = { name: 'ground', type: 'environment' };
        this.scene.add(ground);

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

        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.5, 3, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Foliage (3 spheres stacked)
        const foliageGeometry = new THREE.SphereGeometry(2, 16, 16);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d8b2d,
            roughness: 0.7,
            flatShading: true
        });

        const foliage1 = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage1.position.y = 4;
        foliage1.scale.set(1, 1, 1);
        foliage1.castShadow = true;
        treeGroup.add(foliage1);

        const foliage2 = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage2.position.y = 5.5;
        foliage2.scale.set(0.8, 0.8, 0.8);
        foliage2.castShadow = true;
        treeGroup.add(foliage2);

        const foliage3 = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage3.position.y = 6.5;
        foliage3.scale.set(0.5, 0.5, 0.5);
        foliage3.castShadow = true;
        treeGroup.add(foliage3);

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

        // Petals (5 small spheres arranged in a circle)
        const petalGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const petalMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.4
        });

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

        // Sandbox base
        const boxGeometry = new THREE.BoxGeometry(4, 0.3, 4);
        const boxMaterial = new THREE.MeshStandardMaterial({
            color: 0xf4a460, // Sandy brown
            roughness: 0.9
        });
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.y = 0.15;
        box.castShadow = true;
        box.receiveShadow = true;
        sandboxGroup.add(box);

        // Sandbox borders
        const borderGeometry = new THREE.BoxGeometry(4.4, 0.2, 0.3);
        const borderMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.8
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

        // Frame posts
        const postGeometry = new THREE.CylinderGeometry(0.15, 0.15, 4, 8);
        const postMaterial = new THREE.MeshStandardMaterial({
            color: 0xc0c0c0,
            metalness: 0.6,
            roughness: 0.4
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

        // Slide surface
        const slideGeometry = new THREE.BoxGeometry(1.5, 0.2, 4);
        const slideMaterial = new THREE.MeshStandardMaterial({
            color: 0xff1493, // Deep pink
            roughness: 0.2,
            metalness: 0.3,
            emissive: 0x000000,
            emissiveIntensity: 0
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

        // Seat
        const seatGeometry = new THREE.BoxGeometry(2, 0.2, 0.8);
        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0xd2691e,
            roughness: 0.8
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

        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x696969,
            metalness: 0.5,
            roughness: 0.5
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
            color: 0xd3d3d3, // Light gray
            roughness: 0.9
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

        // Pole
        const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
        const poleMaterial = new THREE.MeshStandardMaterial({
            color: 0x2f4f4f,
            metalness: 0.7,
            roughness: 0.3
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
     * Update method called every frame
     */
    update() {
        this.controls.update();
        this.updateAnimations();
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
