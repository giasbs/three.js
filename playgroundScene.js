import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createNoise3D } from 'simplex-noise';

/**
 * WonderPlay Garden - A Creative Living Playground
 * Redesigned with better structure, creative elements, and optimized performance
 */
export class PlaygroundScene {
    constructor() {
        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // Interaction system
        this.interactiveObjects = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredObject = null;
        this.animatingObjects = new Map();

        // Animation system
        this.clock = new THREE.Clock();
        this.time = 0;

        // Living elements (simplified - no complex shaders)
        this.noise3D = createNoise3D();
        this.flowers = [];
        this.butterflies = [];
        this.floatingLights = [];
        this.balls = [];
        this.fountain = null;
        this.windmills = [];
        this.character = null;

        // Textures
        this.textures = {};
        this.createTextures();

        this.init();
    }

    /**
     * Create all procedural textures with more creativity
     */
    createTextures() {
        this.textures.grass = this.createCreativeGrassTexture();
        this.textures.grassNormal = this.createGrassNormalMap();
        this.textures.wood = this.createWoodTexture();
        this.textures.stone = this.createColorfulStoneTexture();
        this.textures.sand = this.createGoldenSandTexture();
        this.textures.path = this.createPathTexture();
        this.textures.roof = this.createRoofTexture();
    }

    /**
     * Creative grass texture with flowers and variety
     */
    createCreativeGrassTexture() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Vibrant grass base with variation
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const noise = Math.random();
                const r = Math.floor(60 + noise * 40);
                const g = Math.floor(160 + noise * 50);
                const b = Math.floor(65 + noise * 30);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(i, j, 1, 1);
            }
        }

        // Add small flower spots
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = 2 + Math.random() * 3;

            // Random flower colors
            const colors = ['#ff69b4', '#ffff00', '#ff8c00', '#ee82ee', '#00bfff'];
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add grass detail strokes
        ctx.strokeStyle = 'rgba(50, 140, 50, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 300; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.random() * 4 - 2, y - 8);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
    }

    /**
     * Grass normal map
     */
    createGrassNormalMap() {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#8080ff';
        ctx.fillRect(0, 0, size, size);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
    }

    /**
     * Creative wood texture
     */
    createWoodTexture() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Warm wood base
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 0, size, size);

        // Wood grain
        for (let i = 0; i < size; i++) {
            const wave = Math.sin(i * 0.05) * 20;
            ctx.strokeStyle = `rgba(101, 67, 33, ${0.3 + Math.random() * 0.3})`;
            ctx.lineWidth = 2 + Math.random() * 3;
            ctx.beginPath();
            ctx.moveTo(0, i + wave);
            ctx.lineTo(size, i + wave);
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Colorful stone texture
     */
    createColorfulStoneTexture() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Stone base with color variation
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const noise = Math.random();
                const r = Math.floor(140 + noise * 60);
                const g = Math.floor(140 + noise * 50);
                const b = Math.floor(160 + noise * 40);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(i, j, 1, 1);
            }
        }

        // Add stone cracks
        ctx.strokeStyle = 'rgba(80, 80, 80, 0.4)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            ctx.beginPath();
            ctx.moveTo(x, y);
            for (let j = 0; j < 5; j++) {
                ctx.lineTo(x + Math.random() * 30 - 15, y + Math.random() * 30 - 15);
            }
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Golden sand texture
     */
    createGoldenSandTexture() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Golden sand base
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const noise = Math.random();
                const r = Math.floor(230 + noise * 25);
                const g = Math.floor(200 + noise * 30);
                const b = Math.floor(140 + noise * 20);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(i, j, 1, 1);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        return texture;
    }

    /**
     * Colorful path texture
     */
    createPathTexture() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Path base
        ctx.fillStyle = '#d4a574';
        ctx.fillRect(0, 0, size, size);

        // Add colorful pebbles
        const pebbleColors = ['#c49c6b', '#b88a5a', '#a67c52', '#d6b894'];
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = 2 + Math.random() * 5;
            ctx.fillStyle = pebbleColors[Math.floor(Math.random() * pebbleColors.length)];
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Colorful roof texture
     */
    createRoofTexture() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Red tile roof
        ctx.fillStyle = '#d63447';
        ctx.fillRect(0, 0, size, size);

        // Tile pattern
        for (let y = 0; y < size; y += 20) {
            for (let x = 0; x < size; x += 30) {
                ctx.fillStyle = `rgba(150, 40, 50, ${Math.random() * 0.3})`;
                ctx.fillRect(x, y, 28, 18);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Initialize scene, camera, renderer, and all playground elements
     */
    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 40, 100);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            200
        );
        this.camera.position.set(30, 20, 30);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        const canvas = document.getElementById('canvas');
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 70;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05;

        // Create playground elements
        this.createLighting();
        this.createGround();
        this.createPlayArea();
        this.createGarden();
        this.createRelaxZone();
        this.createExplorationZone();
        this.createAtmosphere();
        this.createBoards();
        this.createCharacter();
    }

    /**
     * Enhanced lighting system
     */
    createLighting() {
        // Hemisphere light
        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x6fb357, 0.7);
        this.scene.add(hemiLight);

        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xfff4e6, 0.4);
        this.scene.add(ambientLight);

        // Sun light
        const sunLight = new THREE.DirectionalLight(0xfff8dc, 1.3);
        sunLight.position.set(40, 50, 30);
        sunLight.castShadow = true;
        sunLight.shadow.camera.left = -40;
        sunLight.shadow.camera.right = 40;
        sunLight.shadow.camera.top = 40;
        sunLight.shadow.camera.bottom = -40;
        sunLight.shadow.camera.near = 10;
        sunLight.shadow.camera.far = 100;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.bias = -0.0005;
        this.scene.add(sunLight);
    }

    /**
     * Create vibrant ground
     */
    createGround() {
        const groundGeometry = new THREE.CircleGeometry(50, 64);
        const groundMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.grass,
            normalMap: this.textures.grassNormal,
            roughness: 0.85,
            metalness: 0.0,
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    /**
     * PLAY AREA - Swings, Slide, Seesaw, Balls
     */
    createPlayArea() {
        // Swings
        this.createSwingSet(-15, 0, 8);

        // Colorful Slide
        this.createColorfulSlide(15, 0, 8);

        // Seesaw
        this.createSeesaw(-10, 0, -5);

        // Interactive Balls
        this.createPlayBalls();

        // Spinning Merry-go-round
        this.createMerryGoRound(18, 0, -8);
    }

    /**
     * Create swing set
     */
    createSwingSet(x, y, z) {
        const swingGroup = new THREE.Group();

        // Frame
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6b6b,
            roughness: 0.6,
            metalness: 0.3
        });

        // Posts
        const postGeometry = new THREE.CylinderGeometry(0.15, 0.15, 4, 8);
        const post1 = new THREE.Mesh(postGeometry, frameMaterial);
        post1.position.set(-2, 2, 0);
        post1.castShadow = true;
        swingGroup.add(post1);

        const post2 = new THREE.Mesh(postGeometry, frameMaterial);
        post2.position.set(2, 2, 0);
        post2.castShadow = true;
        swingGroup.add(post2);

        // Top bar
        const barGeometry = new THREE.CylinderGeometry(0.12, 0.12, 4.5, 8);
        const bar = new THREE.Mesh(barGeometry, frameMaterial);
        bar.rotation.z = Math.PI / 2;
        bar.position.set(0, 4, 0);
        bar.castShadow = true;
        swingGroup.add(bar);

        // Swings
        this.createSwing(swingGroup, -1, 4, 0, 0x4ecdc4);
        this.createSwing(swingGroup, 1, 4, 0, 0xffe66d);

        swingGroup.position.set(x, y, z);
        this.scene.add(swingGroup);
    }

    /**
     * Create individual swing
     */
    createSwing(parent, x, y, z, color) {
        const swingGroup = new THREE.Group();

        // Chains
        const chainMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const chainGeometry = new THREE.CylinderGeometry(0.03, 0.03, 2, 6);

        const chain1 = new THREE.Mesh(chainGeometry, chainMaterial);
        chain1.position.set(-0.3, -1, 0);
        swingGroup.add(chain1);

        const chain2 = new THREE.Mesh(chainGeometry, chainMaterial);
        chain2.position.set(0.3, -1, 0);
        swingGroup.add(chain2);

        // Seat
        const seatMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.5,
            metalness: 0.2
        });
        const seatGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.4);
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.set(0, -2, 0);
        seat.castShadow = true;
        swingGroup.add(seat);

        swingGroup.position.set(x, y, z);
        swingGroup.userData = {
            interactive: true,
            type: 'swing',
            name: 'swing',
            description: 'Click to make it swing!'
        };

        parent.add(swingGroup);
        this.interactiveObjects.push(swingGroup);
    }

    /**
     * Create colorful slide
     */
    createColorfulSlide(x, y, z) {
        const slideGroup = new THREE.Group();

        // Platform
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6b6b,
            roughness: 0.6
        });
        const platform = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.2, 2),
            platformMaterial
        );
        platform.position.set(0, 2, -1);
        platform.castShadow = true;
        slideGroup.add(platform);

        // Support posts
        const postMaterial = new THREE.MeshStandardMaterial({ color: 0xfeca57 });
        const postGeometry = new THREE.CylinderGeometry(0.15, 0.15, 2, 8);

        [[-0.8, 1, -1.8], [0.8, 1, -1.8], [-0.8, 1, -0.2], [0.8, 1, -0.2]].forEach(([px, py, pz]) => {
            const post = new THREE.Mesh(postGeometry, postMaterial);
            post.position.set(px, py, pz);
            post.castShadow = true;
            slideGroup.add(post);
        });

        // Slide surface - rainbow colored
        const slideColors = [0xff6b6b, 0xfeca57, 0x48dbfb, 0xff9ff3, 0x54a0ff];
        for (let i = 0; i < 5; i++) {
            const slideMaterial = new THREE.MeshStandardMaterial({
                color: slideColors[i],
                roughness: 0.3,
                metalness: 0.4
            });
            const slideSegment = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 0.1, 1),
                slideMaterial
            );
            slideSegment.position.set(0, 1.8 - i * 0.4, i * 0.8);
            slideSegment.rotation.x = -0.5;
            slideSegment.castShadow = true;
            slideGroup.add(slideSegment);
        }

        // Ladder
        const ladderMaterial = new THREE.MeshStandardMaterial({ color: 0x1dd1a1 });
        for (let i = 0; i < 5; i++) {
            const rung = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8),
                ladderMaterial
            );
            rung.rotation.z = Math.PI / 2;
            rung.position.set(-0.8, 0.5 + i * 0.4, -1.8);
            rung.castShadow = true;
            slideGroup.add(rung);
        }

        slideGroup.position.set(x, y, z);
        slideGroup.userData = {
            interactive: true,
            type: 'slide',
            name: 'rainbow-slide',
            description: 'Wheee! A rainbow slide!'
        };

        this.scene.add(slideGroup);
        this.interactiveObjects.push(slideGroup);
    }

    /**
     * Create seesaw
     */
    createSeesaw(x, y, z) {
        const seesawGroup = new THREE.Group();

        // Base
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x8854d0,
            roughness: 0.6
        });
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.4, 0.8, 8),
            baseMaterial
        );
        base.position.set(0, 0.4, 0);
        base.castShadow = true;
        seesawGroup.add(base);

        // Board
        const boardMaterial = new THREE.MeshStandardMaterial({
            color: 0xfeca57,
            roughness: 0.5
        });
        const board = new THREE.Mesh(
            new THREE.BoxGeometry(4, 0.2, 0.6),
            boardMaterial
        );
        board.position.set(0, 0.9, 0);
        board.castShadow = true;
        seesawGroup.add(board);

        // Handles
        const handleMaterial = new THREE.MeshStandardMaterial({ color: 0xff6b6b });
        const handle1 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8),
            handleMaterial
        );
        handle1.position.set(-1.7, 1.2, 0);
        handle1.castShadow = true;
        seesawGroup.add(handle1);

        const handle2 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8),
            handleMaterial
        );
        handle2.position.set(1.7, 1.2, 0);
        handle2.castShadow = true;
        seesawGroup.add(handle2);

        seesawGroup.position.set(x, y, z);
        seesawGroup.userData = {
            interactive: true,
            type: 'seesaw',
            name: 'seesaw',
            description: 'Click to rock the seesaw!'
        };

        this.scene.add(seesawGroup);
        this.interactiveObjects.push(seesawGroup);
    }

    /**
     * Create merry-go-round
     */
    createMerryGoRound(x, y, z) {
        const merryGroup = new THREE.Group();

        // Base platform
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6b6b,
            roughness: 0.4,
            metalness: 0.3
        });
        const platform = new THREE.Mesh(
            new THREE.CylinderGeometry(2, 2, 0.3, 32),
            platformMaterial
        );
        platform.position.set(0, 0.15, 0);
        platform.castShadow = true;
        merryGroup.add(platform);

        // Colorful poles
        const poleColors = [0x48dbfb, 0xfeca57, 0xff9ff3, 0x1dd1a1, 0xff6b6b];
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const poleMaterial = new THREE.MeshStandardMaterial({ color: poleColors[i] });
            const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8),
                poleMaterial
            );
            pole.position.set(
                Math.cos(angle) * 1.3,
                1.05,
                Math.sin(angle) * 1.3
            );
            pole.castShadow = true;
            merryGroup.add(pole);
        }

        merryGroup.position.set(x, y, z);
        merryGroup.userData = {
            type: 'merry-go-round',
            rotating: true
        };

        this.windmills.push({ mesh: merryGroup, speed: 0.3 });
        this.scene.add(merryGroup);
    }

    /**
     * Create interactive play balls
     */
    createPlayBalls() {
        // Ball 1 - Soccer ball
        const ball1 = this.createBall(0.5, 0xff6b6b, 8, 0.5, 5);
        ball1.userData.name = 'Red Ball';

        // Ball 2 - Beach ball
        const ball2 = this.createBall(0.45, 0x48dbfb, -8, 0.45, -3);
        ball2.userData.name = 'Blue Ball';

        // Ball 3 - Tennis ball
        const ball3 = this.createBall(0.4, 0xfeca57, 3, 0.4, -8);
        ball3.userData.name = 'Yellow Ball';
    }

    /**
     * Create a single ball
     */
    createBall(radius, color, posX, posY, posZ) {
        const ballGeometry = new THREE.SphereGeometry(radius, 32, 32);
        const ballMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.5,
            metalness: 0.2
        });
        const ball = new THREE.Mesh(ballGeometry, ballMaterial);
        ball.position.set(posX, posY, posZ);
        ball.castShadow = true;
        ball.receiveShadow = true;
        ball.userData = {
            interactive: true,
            type: 'ball',
            description: 'Click to kick the ball!'
        };

        // Physics data
        const ballPhysics = {
            mesh: ball,
            velocity: new THREE.Vector3(0, 0, 0),
            friction: 0.9,
            gravity: -20,
            radius: radius
        };
        this.balls.push(ballPhysics);

        this.scene.add(ball);
        this.interactiveObjects.push(ball);

        return ball;
    }

    /**
     * GARDEN ZONE - Trees, Flowers, Fountain
     */
    createGarden() {
        // Colorful trees
        this.createColorfulTree(-25, 0, -15, 0x48dbfb);
        this.createColorfulTree(-20, 0, -20, 0xff9ff3);
        this.createColorfulTree(-30, 0, -18, 0xfeca57);

        // Flower patches
        this.createFlowerPatch(-25, 0, 10);
        this.createFlowerPatch(25, 0, 15);
        this.createFlowerPatch(20, 0, -15);

        // Magic fountain
        this.createFountain(0, 0, -20);
    }

    /**
     * Create colorful tree
     */
    createColorfulTree(x, y, z, foliageColor) {
        const treeGroup = new THREE.Group();

        // Trunk
        const trunkMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.wood,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.5, 4, 8),
            trunkMaterial
        );
        trunk.position.set(0, 2, 0);
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Colorful foliage
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: foliageColor,
            roughness: 0.8
        });

        // Multiple foliage spheres for fuller look
        const positions = [
            [0, 4.5, 0, 2.5],
            [-1, 4, 0, 1.8],
            [1, 4, 0, 1.8],
            [0, 4, -1, 1.8],
            [0, 4, 1, 1.8],
            [0, 5.5, 0, 1.5]
        ];

        positions.forEach(([px, py, pz, radius]) => {
            const foliage = new THREE.Mesh(
                new THREE.SphereGeometry(radius, 16, 16),
                foliageMaterial
            );
            foliage.position.set(px, py, pz);
            foliage.castShadow = true;
            treeGroup.add(foliage);
        });

        treeGroup.position.set(x, y, z);
        treeGroup.userData = {
            interactive: true,
            type: 'tree',
            name: 'colorful-tree',
            description: 'A magical colorful tree!'
        };

        this.scene.add(treeGroup);
        this.interactiveObjects.push(treeGroup);
    }

    /**
     * Create flower patch
     */
    createFlowerPatch(x, y, z) {
        const flowerGroup = new THREE.Group();
        const colors = [0xff69b4, 0xff6b6b, 0xfeca57, 0x48dbfb, 0xff9ff3, 0x1dd1a1];

        for (let i = 0; i < 15; i++) {
            const offsetX = (Math.random() - 0.5) * 4;
            const offsetZ = (Math.random() - 0.5) * 4;

            // Stem
            const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x2ecc71 });
            const stem = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6),
                stemMaterial
            );
            stem.position.set(offsetX, 0.25, offsetZ);
            flowerGroup.add(stem);

            // Flower
            const flowerColor = colors[Math.floor(Math.random() * colors.length)];
            const flowerMaterial = new THREE.MeshStandardMaterial({
                color: flowerColor,
                emissive: flowerColor,
                emissiveIntensity: 0.2
            });
            const flower = new THREE.Mesh(
                new THREE.SphereGeometry(0.15, 8, 8),
                flowerMaterial
            );
            flower.position.set(offsetX, 0.55, offsetZ);
            flower.castShadow = true;
            flowerGroup.add(flower);

            // Store for animation
            this.flowers.push({
                mesh: flower,
                baseY: 0.55,
                offset: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 0.5
            });
        }

        flowerGroup.position.set(x, y, z);
        this.scene.add(flowerGroup);
    }

    /**
     * Create magical fountain
     */
    createFountain(x, y, z) {
        const fountainGroup = new THREE.Group();

        // Base pool
        const poolMaterial = new THREE.MeshStandardMaterial({
            color: 0x48dbfb,
            roughness: 0.2,
            metalness: 0.8,
            emissive: 0x48dbfb,
            emissiveIntensity: 0.3
        });
        const pool = new THREE.Mesh(
            new THREE.CylinderGeometry(2, 2, 0.5, 32),
            poolMaterial
        );
        pool.position.set(0, 0.25, 0);
        pool.castShadow = true;
        fountainGroup.add(pool);

        // Center pillar
        const pillarMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.stone,
            roughness: 0.7
        });
        const pillar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.4, 2, 16),
            pillarMaterial
        );
        pillar.position.set(0, 1.5, 0);
        pillar.castShadow = true;
        fountainGroup.add(pillar);

        // Water particles (simplified - no complex shaders)
        const particleCount = 50;
        const particleGeometry = new THREE.SphereGeometry(0.05, 6, 6);
        const particleMaterial = new THREE.MeshStandardMaterial({
            color: 0x48dbfb,
            emissive: 0x48dbfb,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });

        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(0, 2.5, 0);
            particle.userData = {
                phase: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 0.5,
                radius: Math.random() * 0.8
            };
            fountainGroup.add(particle);
        }

        this.fountain = fountainGroup;
        fountainGroup.position.set(x, y, z);
        this.scene.add(fountainGroup);
    }

    /**
     * RELAX ZONE - Benches, House, Gazebo
     */
    createRelaxZone() {
        // Colorful benches
        this.createBench(10, 0, 18, 0xff6b6b);     // Red bench
        this.createBench(-10, 0, 18, 0x48dbfb);    // Blue bench
        this.createBench(0, 0, -25, 0xfeca57);     // Yellow bench near fountain
        this.createBench(-20, 0, 12, 0xff9ff3);    // Pink bench near house
        this.createBench(22, 0, -22, 0x1dd1a1);    // Green bench near gazebo
        this.createBench(8, 0, -15, 0x8854d0);     // Purple bench near sandbox
        this.createBench(-18, 0, 0, 0xf39c12);     // Orange bench in garden

        // Cozy house
        this.createCozyHouse(-28, 0, 8);

        // Gazebo
        this.createGazebo(25, 0, -20);
    }

    /**
     * Create colorful bench
     */
    createBench(x, y, z, color) {
        const benchGroup = new THREE.Group();

        // Seat
        const seatMaterial = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.6
        });
        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.2, 0.8),
            seatMaterial
        );
        seat.position.set(0, 0.5, 0);
        seat.castShadow = true;
        benchGroup.add(seat);

        // Backrest
        const backrest = new THREE.Mesh(
            new THREE.BoxGeometry(2, 1, 0.1),
            seatMaterial
        );
        backrest.position.set(0, 1, -0.35);
        backrest.castShadow = true;
        benchGroup.add(backrest);

        // Legs
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        [[-0.7, 0.25, 0.3], [0.7, 0.25, 0.3], [-0.7, 0.25, -0.3], [0.7, 0.25, -0.3]].forEach(([lx, ly, lz]) => {
            const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8),
                legMaterial
            );
            leg.position.set(lx, ly, lz);
            leg.castShadow = true;
            benchGroup.add(leg);
        });

        benchGroup.position.set(x, y, z);
        this.scene.add(benchGroup);
    }

    /**
     * Create cozy house
     */
    createCozyHouse(x, y, z) {
        const houseGroup = new THREE.Group();

        // Walls
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd93d,
            roughness: 0.8
        });
        const walls = new THREE.Mesh(
            new THREE.BoxGeometry(5, 3, 4),
            wallMaterial
        );
        walls.position.set(0, 1.5, 0);
        walls.castShadow = true;
        walls.receiveShadow = true;
        houseGroup.add(walls);

        // Roof
        const roofMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.roof,
            roughness: 0.9
        });
        const roofGeometry = new THREE.ConeGeometry(3.5, 2, 4);
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(0, 4, 0);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        houseGroup.add(roof);

        // Door
        const doorMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.7
        });
        const door = new THREE.Mesh(
            new THREE.BoxGeometry(1, 2, 0.1),
            doorMaterial
        );
        door.position.set(0, 1, 2.05);
        door.castShadow = true;
        houseGroup.add(door);

        // Windows
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0x87ceeb,
            emissive: 0xffeb3b,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.7
        });

        const window1 = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.8, 0.1),
            windowMaterial
        );
        window1.position.set(-1.2, 1.5, 2.05);
        houseGroup.add(window1);

        const window2 = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.8, 0.1),
            windowMaterial
        );
        window2.position.set(1.2, 1.5, 2.05);
        houseGroup.add(window2);

        // Chimney
        const chimneyMaterial = new THREE.MeshStandardMaterial({ color: 0xa0522d });
        const chimney = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 1.5, 0.5),
            chimneyMaterial
        );
        chimney.position.set(1.5, 4.5, 0);
        chimney.castShadow = true;
        houseGroup.add(chimney);

        houseGroup.position.set(x, y, z);
        houseGroup.userData = {
            interactive: true,
            type: 'house',
            name: 'cozy-house',
            description: 'A warm and cozy little house!'
        };

        this.scene.add(houseGroup);
        this.interactiveObjects.push(houseGroup);
    }

    /**
     * Create gazebo
     */
    createGazebo(x, y, z) {
        const gazeboGroup = new THREE.Group();

        // Floor
        const floorMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.wood,
            roughness: 0.8
        });
        const floor = new THREE.Mesh(
            new THREE.CylinderGeometry(3, 3, 0.2, 8),
            floorMaterial
        );
        floor.position.set(0, 0.1, 0);
        floor.castShadow = true;
        gazeboGroup.add(floor);

        // Pillars
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.7
        });

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const pillar = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.15, 3, 8),
                pillarMaterial
            );
            pillar.position.set(
                Math.cos(angle) * 2.5,
                1.7,
                Math.sin(angle) * 2.5
            );
            pillar.castShadow = true;
            gazeboGroup.add(pillar);
        }

        // Roof
        const roofMaterial = new THREE.MeshStandardMaterial({
            color: 0x8854d0,
            roughness: 0.6
        });
        const roof = new THREE.Mesh(
            new THREE.ConeGeometry(3.5, 2, 8),
            roofMaterial
        );
        roof.position.set(0, 4, 0);
        roof.castShadow = true;
        gazeboGroup.add(roof);

        gazeboGroup.position.set(x, y, z);
        this.scene.add(gazeboGroup);
    }

    /**
     * EXPLORATION ZONE - Sandbox, Rocks, Mushrooms
     */
    createExplorationZone() {
        // Sandbox
        this.createSandbox(5, 0, -18);

        // Rock formations
        this.createRockFormation(-5, 0, 25);
        this.createRockFormation(15, 0, 25);

        // Glowing mushroom circle
        this.createMushroomCircle(-18, 0, -25);
    }

    /**
     * Create sandbox
     */
    createSandbox(x, y, z) {
        const sandboxGroup = new THREE.Group();

        // Frame
        const frameMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.wood,
            roughness: 0.9
        });

        const frameGeometry = new THREE.BoxGeometry(5, 0.3, 0.3);
        const sides = [
            [0, 0.15, -2.35],
            [0, 0.15, 2.35],
            [-2.35, 0.15, 0, Math.PI / 2],
            [2.35, 0.15, 0, Math.PI / 2]
        ];

        sides.forEach(([sx, sy, sz, rotation = 0]) => {
            const frame = new THREE.Mesh(frameGeometry, frameMaterial);
            frame.position.set(sx, sy, sz);
            frame.rotation.y = rotation;
            frame.castShadow = true;
            sandboxGroup.add(frame);
        });

        // Sand
        const sandMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.sand,
            roughness: 0.95
        });
        const sand = new THREE.Mesh(
            new THREE.BoxGeometry(4.7, 0.5, 4.7),
            sandMaterial
        );
        sand.position.set(0, 0.05, 0);
        sand.receiveShadow = true;
        sandboxGroup.add(sand);

        // Sand toys
        this.createSandToys(sandboxGroup);

        sandboxGroup.position.set(x, y, z);
        this.scene.add(sandboxGroup);
    }

    /**
     * Create sand toys
     */
    createSandToys(parent) {
        // Bucket
        const bucketMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6b6b,
            roughness: 0.4,
            metalness: 0.2
        });
        const bucket = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.25, 0.4, 16),
            bucketMaterial
        );
        bucket.position.set(-1, 0.5, -1);
        bucket.castShadow = true;
        parent.add(bucket);

        // Shovel
        const shovelMaterial = new THREE.MeshStandardMaterial({ color: 0x48dbfb });
        const shovelHandle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8),
            shovelMaterial
        );
        shovelHandle.position.set(1, 0.45, 1);
        shovelHandle.rotation.x = Math.PI / 4;
        shovelHandle.castShadow = true;
        parent.add(shovelHandle);
    }

    /**
     * Create rock formation
     */
    createRockFormation(x, y, z) {
        const rockGroup = new THREE.Group();
        const rockMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.stone,
            roughness: 0.9
        });

        // Random rocks
        for (let i = 0; i < 5; i++) {
            const size = 0.5 + Math.random() * 1;
            const rock = new THREE.Mesh(
                new THREE.DodecahedronGeometry(size, 0),
                rockMaterial
            );
            rock.position.set(
                (Math.random() - 0.5) * 3,
                size * 0.5,
                (Math.random() - 0.5) * 3
            );
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.castShadow = true;
            rockGroup.add(rock);
        }

        rockGroup.position.set(x, y, z);
        this.scene.add(rockGroup);
    }

    /**
     * Create glowing mushroom circle
     */
    createMushroomCircle(x, y, z) {
        const mushroomGroup = new THREE.Group();
        const mushroomColors = [0xff6b6b, 0x48dbfb, 0xfeca57, 0xff9ff3, 0x1dd1a1];

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 3;

            // Stem
            const stemMaterial = new THREE.MeshStandardMaterial({
                color: 0xfaf9f6,
                roughness: 0.7
            });
            const stem = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.12, 0.5, 8),
                stemMaterial
            );
            stem.position.set(
                Math.cos(angle) * radius,
                0.25,
                Math.sin(angle) * radius
            );
            stem.castShadow = true;
            mushroomGroup.add(stem);

            // Cap (glowing)
            const capColor = mushroomColors[i % mushroomColors.length];
            const capMaterial = new THREE.MeshStandardMaterial({
                color: capColor,
                emissive: capColor,
                emissiveIntensity: 0.5,
                roughness: 0.6
            });
            const cap = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
                capMaterial
            );
            cap.position.set(
                Math.cos(angle) * radius,
                0.55,
                Math.sin(angle) * radius
            );
            cap.castShadow = true;
            mushroomGroup.add(cap);

            // Point light for glow effect
            const light = new THREE.PointLight(capColor, 0.5, 2);
            light.position.set(
                Math.cos(angle) * radius,
                0.8,
                Math.sin(angle) * radius
            );
            mushroomGroup.add(light);
        }

        mushroomGroup.position.set(x, y, z);
        this.scene.add(mushroomGroup);
    }

    /**
     * ATMOSPHERE - Butterflies, Clouds, Floating Lights
     */
    createAtmosphere() {
        // Butterflies
        this.createButterflies();

        // Clouds
        this.createClouds();

        // Floating magic lights
        this.createFloatingLights();
    }

    /**
     * Create butterflies
     */
    createButterflies() {
        const butterflyColors = [0xff69b4, 0xfeca57, 0x48dbfb, 0xff9ff3];

        for (let i = 0; i < 6; i++) {
            const butterflyGroup = new THREE.Group();
            const color = butterflyColors[i % butterflyColors.length];

            // Body
            const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 0.15, 8),
                bodyMaterial
            );
            butterflyGroup.add(body);

            // Wings
            const wingMaterial = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.3,
                side: THREE.DoubleSide
            });

            const wingGeometry = new THREE.CircleGeometry(0.12, 8);
            const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
            leftWing.position.set(-0.1, 0, 0);
            leftWing.rotation.y = Math.PI / 4;
            butterflyGroup.add(leftWing);

            const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
            rightWing.position.set(0.1, 0, 0);
            rightWing.rotation.y = -Math.PI / 4;
            butterflyGroup.add(rightWing);

            // Random position
            butterflyGroup.position.set(
                (Math.random() - 0.5) * 40,
                1 + Math.random() * 3,
                (Math.random() - 0.5) * 40
            );

            this.butterflies.push({
                mesh: butterflyGroup,
                leftWing: leftWing,
                rightWing: rightWing,
                phase: Math.random() * Math.PI * 2,
                speed: 0.3 + Math.random() * 0.3,
                radius: 5 + Math.random() * 10,
                center: butterflyGroup.position.clone()
            });

            this.scene.add(butterflyGroup);
        }
    }

    /**
     * Create clouds
     */
    createClouds() {
        const cloudMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            roughness: 1
        });

        for (let i = 0; i < 6; i++) {
            const cloudGroup = new THREE.Group();

            // Multiple spheres for fluffy cloud
            for (let j = 0; j < 5; j++) {
                const cloudPart = new THREE.Mesh(
                    new THREE.SphereGeometry(1 + Math.random(), 8, 8),
                    cloudMaterial
                );
                cloudPart.position.set(
                    (Math.random() - 0.5) * 3,
                    (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 3
                );
                cloudGroup.add(cloudPart);
            }

            cloudGroup.position.set(
                (Math.random() - 0.5) * 80,
                25 + Math.random() * 10,
                (Math.random() - 0.5) * 80
            );

            this.scene.add(cloudGroup);
        }
    }

    /**
     * Create floating magic lights
     */
    createFloatingLights() {
        const lightColors = [0xff69b4, 0xfeca57, 0x48dbfb, 0xff9ff3, 0x1dd1a1];

        for (let i = 0; i < 10; i++) {
            const color = lightColors[Math.floor(Math.random() * lightColors.length)];

            const lightMaterial = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 1,
                transparent: true,
                opacity: 0.8
            });

            const light = new THREE.Mesh(
                new THREE.SphereGeometry(0.15, 8, 8),
                lightMaterial
            );

            light.position.set(
                (Math.random() - 0.5) * 50,
                2 + Math.random() * 3,
                (Math.random() - 0.5) * 50
            );

            // Point light for glow
            const pointLight = new THREE.PointLight(color, 0.5, 3);
            light.add(pointLight);

            this.floatingLights.push({
                mesh: light,
                baseY: light.position.y,
                phase: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 0.5
            });

            this.scene.add(light);
        }
    }

    /**
     * Create a walking male character
     */
    createCharacter() {
        const characterGroup = new THREE.Group();

        // Body proportions
        const bodyColor = 0x4a90e2; // Blue shirt
        const skinColor = 0xffdbac; // Skin tone
        const pantsColor = 0x2c3e50; // Dark pants
        const hairColor = 0x3d2817; // Brown hair

        // Head
        const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: skinColor,
            roughness: 0.8
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 1.6, 0);
        head.castShadow = true;
        characterGroup.add(head);

        // Hair
        const hairGeometry = new THREE.SphereGeometry(0.32, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const hairMaterial = new THREE.MeshStandardMaterial({
            color: hairColor,
            roughness: 0.9
        });
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.set(0, 1.75, 0);
        hair.castShadow = true;
        characterGroup.add(hair);

        // Torso
        const torsoGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.8, 16);
        const torsoMaterial = new THREE.MeshStandardMaterial({
            color: bodyColor,
            roughness: 0.7
        });
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.set(0, 0.9, 0);
        torso.castShadow = true;
        characterGroup.add(torso);

        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8);
        const armMaterial = new THREE.MeshStandardMaterial({
            color: bodyColor,
            roughness: 0.7
        });

        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.35, 0.9, 0);
        leftArm.castShadow = true;
        characterGroup.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.35, 0.9, 0);
        rightArm.castShadow = true;
        characterGroup.add(rightArm);

        // Hands
        const handGeometry = new THREE.SphereGeometry(0.09, 8, 8);
        const handMaterial = new THREE.MeshStandardMaterial({
            color: skinColor,
            roughness: 0.8
        });

        const leftHand = new THREE.Mesh(handGeometry, handMaterial);
        leftHand.position.set(-0.35, 0.5, 0);
        leftHand.castShadow = true;
        characterGroup.add(leftHand);

        const rightHand = new THREE.Mesh(handGeometry, handMaterial);
        rightHand.position.set(0.35, 0.5, 0);
        rightHand.castShadow = true;
        characterGroup.add(rightHand);

        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.09, 0.7, 8);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: pantsColor,
            roughness: 0.8
        });

        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.12, 0.15, 0);
        leftLeg.castShadow = true;
        characterGroup.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.12, 0.15, 0);
        rightLeg.castShadow = true;
        characterGroup.add(rightLeg);

        // Shoes
        const shoeGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.25);
        const shoeMaterial = new THREE.MeshStandardMaterial({
            color: 0x654321,
            roughness: 0.9
        });

        const leftShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
        leftShoe.position.set(-0.12, -0.15, 0.05);
        leftShoe.castShadow = true;
        characterGroup.add(leftShoe);

        const rightShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
        rightShoe.position.set(0.12, -0.15, 0.05);
        rightShoe.castShadow = true;
        characterGroup.add(rightShoe);

        // Starting position
        characterGroup.position.set(0, 0, 0);

        // Store references for animation
        this.character = {
            group: characterGroup,
            leftArm: leftArm,
            rightArm: rightArm,
            leftLeg: leftLeg,
            rightLeg: rightLeg,
            leftHand: leftHand,
            rightHand: rightHand,
            leftShoe: leftShoe,
            rightShoe: rightShoe,
            pathProgress: 0,
            walkSpeed: 0.3,
            // Walking path points (circular around playground)
            path: [
                { x: 0, z: 15 },
                { x: 15, z: 10 },
                { x: 20, z: 0 },
                { x: 15, z: -10 },
                { x: 0, z: -15 },
                { x: -15, z: -10 },
                { x: -20, z: 0 },
                { x: -15, z: 10 }
            ]
        };

        this.scene.add(characterGroup);
    }

    /**
     * Update character walking animation
     */
    updateCharacter(time) {
        if (!this.character) return;

        const char = this.character;
        const path = char.path;

        // Update path progress
        char.pathProgress += char.walkSpeed * 0.01;
        if (char.pathProgress >= path.length) {
            char.pathProgress = 0;
        }

        // Get current and next points
        const currentIndex = Math.floor(char.pathProgress);
        const nextIndex = (currentIndex + 1) % path.length;
        const t = char.pathProgress - currentIndex;

        const current = path[currentIndex];
        const next = path[nextIndex];

        // Interpolate position
        char.group.position.x = current.x + (next.x - current.x) * t;
        char.group.position.z = current.z + (next.z - current.z) * t;

        // Calculate direction for rotation
        const dx = next.x - current.x;
        const dz = next.z - current.z;
        const angle = Math.atan2(dx, dz);
        char.group.rotation.y = angle;

        // Walking animation (arm and leg swing)
        const walkCycle = time * 5;

        // Arms swing opposite to legs
        char.leftArm.rotation.x = Math.sin(walkCycle) * 0.5;
        char.rightArm.rotation.x = Math.sin(walkCycle + Math.PI) * 0.5;

        // Legs swing
        char.leftLeg.rotation.x = Math.sin(walkCycle + Math.PI) * 0.4;
        char.rightLeg.rotation.x = Math.sin(walkCycle) * 0.4;

        // Slight body bob
        char.group.position.y = Math.abs(Math.sin(walkCycle * 2)) * 0.05;
    }

    /**
     * Create billboard/whiteboard structures for project overviews
     */
    createBoards() {
        // Board 1 - Billboard near play area
        this.createBillboard(20, 0, 15, 'Project Board 1');

        // Board 2 - Whiteboard near garden
        this.createWhiteboard(-15, 0, -8, 'Project Board 2');
    }

    /**
     * Create a billboard structure
     */
    createBillboard(x, y, z, title) {
        const boardGroup = new THREE.Group();

        // Support posts
        const postMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.8
        });

        const leftPost = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 5, 8),
            postMaterial
        );
        leftPost.position.set(-2.5, 2.5, 0);
        leftPost.castShadow = true;
        boardGroup.add(leftPost);

        const rightPost = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 5, 8),
            postMaterial
        );
        rightPost.position.set(2.5, 2.5, 0);
        rightPost.castShadow = true;
        boardGroup.add(rightPost);

        // Create high-resolution canvas for board
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 768;
        const ctx = canvas.getContext('2d');

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Border
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 8;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

        // Title
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, canvas.width / 2, 100);

        // Placeholder content
        ctx.font = '40px Arial';
        ctx.fillStyle = '#555555';
        ctx.fillText('Project Overview', canvas.width / 2, 200);

        ctx.font = '30px Arial';
        ctx.fillStyle = '#777777';
        ctx.fillText('Coming Soon...', canvas.width / 2, 400);

        // Small decorative elements
        ctx.fillStyle = '#3498db';
        ctx.fillRect(100, 500, 200, 10);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(350, 500, 200, 10);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(600, 500, 200, 10);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // Board surface
        const boardMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.3,
            metalness: 0.1
        });

        const board = new THREE.Mesh(
            new THREE.BoxGeometry(5, 3.5, 0.1),
            boardMaterial
        );
        board.position.set(0, 3.5, 0);
        board.castShadow = true;
        board.receiveShadow = true;
        boardGroup.add(board);

        // Frame
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x2c3e50,
            roughness: 0.5,
            metalness: 0.3
        });

        // Frame edges
        const frameTop = new THREE.Mesh(
            new THREE.BoxGeometry(5.2, 0.15, 0.15),
            frameMaterial
        );
        frameTop.position.set(0, 5.35, 0);
        frameTop.castShadow = true;
        boardGroup.add(frameTop);

        const frameBottom = new THREE.Mesh(
            new THREE.BoxGeometry(5.2, 0.15, 0.15),
            frameMaterial
        );
        frameBottom.position.set(0, 1.65, 0);
        frameBottom.castShadow = true;
        boardGroup.add(frameBottom);

        const frameLeft = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 3.7, 0.15),
            frameMaterial
        );
        frameLeft.position.set(-2.6, 3.5, 0);
        frameLeft.castShadow = true;
        boardGroup.add(frameLeft);

        const frameRight = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 3.7, 0.15),
            frameMaterial
        );
        frameRight.position.set(2.6, 3.5, 0);
        frameRight.castShadow = true;
        boardGroup.add(frameRight);

        boardGroup.position.set(x, y, z);
        boardGroup.userData = {
            interactive: true,
            type: 'board',
            name: title,
            description: 'Click to view project details!',
            canvas: canvas,
            texture: texture
        };

        this.scene.add(boardGroup);
        this.interactiveObjects.push(boardGroup);
    }

    /**
     * Create a whiteboard structure
     */
    createWhiteboard(x, y, z, title) {
        const boardGroup = new THREE.Group();

        // Stand/Easel structure
        const standMaterial = new THREE.MeshStandardMaterial({
            color: 0x34495e,
            roughness: 0.6,
            metalness: 0.4
        });

        // Main support pole
        const mainPole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.12, 4, 8),
            standMaterial
        );
        mainPole.position.set(0, 2, 0.3);
        mainPole.castShadow = true;
        boardGroup.add(mainPole);

        // Tripod legs
        const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const leg = new THREE.Mesh(legGeometry, standMaterial);
            leg.position.set(
                Math.cos(angle) * 0.5,
                0.5,
                0.3 + Math.sin(angle) * 0.5
            );
            leg.rotation.z = Math.cos(angle) * 0.2;
            leg.rotation.x = Math.sin(angle) * 0.2;
            leg.castShadow = true;
            boardGroup.add(leg);
        }

        // Create high-resolution canvas for whiteboard
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 768;
        const ctx = canvas.getContext('2d');

        // Whiteboard background
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Subtle grid
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 50) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }

        // Title
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 56px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, canvas.width / 2, 80);

        // Underline
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(200, 100);
        ctx.lineTo(824, 100);
        ctx.stroke();

        // Placeholder sketch content
        ctx.font = '36px Arial';
        ctx.fillStyle = '#34495e';
        ctx.fillText('Project Showcase', canvas.width / 2, 200);

        // Draw some placeholder boxes/wireframes
        ctx.strokeStyle = '#95a5a6';
        ctx.lineWidth = 3;
        ctx.strokeRect(100, 250, 300, 200);
        ctx.strokeRect(450, 250, 300, 200);

        ctx.fillStyle = '#7f8c8d';
        ctx.font = '28px Arial';
        ctx.fillText('Feature 1', 250, 360);
        ctx.fillText('Feature 2', 600, 360);

        // Marker dots for emphasis
        const dotColors = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db'];
        dotColors.forEach((color, i) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(150 + i * 200, 550, 20, 0, Math.PI * 2);
            ctx.fill();
        });

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // Whiteboard surface
        const boardMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.2,
            metalness: 0.05,
            emissive: 0xffffff,
            emissiveIntensity: 0.1
        });

        const board = new THREE.Mesh(
            new THREE.BoxGeometry(4, 3, 0.08),
            boardMaterial
        );
        board.position.set(0, 3.5, 0);
        board.castShadow = true;
        board.receiveShadow = true;
        boardGroup.add(board);

        // Aluminum frame
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0xbdc3c7,
            roughness: 0.3,
            metalness: 0.8
        });

        const frameTop = new THREE.Mesh(
            new THREE.BoxGeometry(4.2, 0.1, 0.1),
            frameMaterial
        );
        frameTop.position.set(0, 5.05, 0);
        frameTop.castShadow = true;
        boardGroup.add(frameTop);

        const frameBottom = new THREE.Mesh(
            new THREE.BoxGeometry(4.2, 0.1, 0.1),
            frameMaterial
        );
        frameBottom.position.set(0, 1.95, 0);
        frameBottom.castShadow = true;
        boardGroup.add(frameBottom);

        const frameLeft = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 3.2, 0.1),
            frameMaterial
        );
        frameLeft.position.set(-2.05, 3.5, 0);
        frameLeft.castShadow = true;
        boardGroup.add(frameLeft);

        const frameRight = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 3.2, 0.1),
            frameMaterial
        );
        frameRight.position.set(2.05, 3.5, 0);
        frameRight.castShadow = true;
        boardGroup.add(frameRight);

        // Marker tray
        const trayMaterial = new THREE.MeshStandardMaterial({
            color: 0x95a5a6,
            roughness: 0.5,
            metalness: 0.3
        });

        const tray = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.1, 0.2),
            trayMaterial
        );
        tray.position.set(0, 1.85, 0.15);
        tray.castShadow = true;
        boardGroup.add(tray);

        boardGroup.position.set(x, y, z);
        boardGroup.rotation.y = Math.PI / 6; // Angle it slightly
        boardGroup.userData = {
            interactive: true,
            type: 'board',
            name: title,
            description: 'Click to view project details!',
            canvas: canvas,
            texture: texture
        };

        this.scene.add(boardGroup);
        this.interactiveObjects.push(boardGroup);
    }

    /**
     * Kick ball with physics
     */
    kickBall(ball, direction) {
        const ballPhysics = this.balls.find(b => b.mesh === ball);
        if (!ballPhysics) return;

        const kickStrength = 10;
        ballPhysics.velocity.set(
            direction.x * kickStrength,
            4, // Upward component
            direction.z * kickStrength
        );
    }

    /**
     * Update ball physics
     */
    updateBalls(deltaTime) {
        this.balls.forEach(ball => {
            // Skip if stationary
            if (ball.velocity.lengthSq() < 0.01) {
                ball.velocity.set(0, 0, 0);
                if (ball.mesh.position.y < ball.radius) {
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
                ball.velocity.y *= -0.6; // Bounce

                if (Math.abs(ball.velocity.y) < 0.5) {
                    ball.velocity.y = 0;
                }
            }

            // Apply friction
            if (ball.mesh.position.y <= ball.radius + 0.01) {
                ball.velocity.x *= ball.friction;
                ball.velocity.z *= ball.friction;
            }

            // Boundaries
            const maxDist = 45;
            if (Math.abs(ball.mesh.position.x) > maxDist) {
                ball.mesh.position.x = Math.sign(ball.mesh.position.x) * maxDist;
                ball.velocity.x *= -0.5;
            }
            if (Math.abs(ball.mesh.position.z) > maxDist) {
                ball.mesh.position.z = Math.sign(ball.mesh.position.z) * maxDist;
                ball.velocity.z *= -0.5;
            }

            // Rotation
            const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.z ** 2);
            if (speed > 0.1) {
                const axis = new THREE.Vector3(-ball.velocity.z, 0, ball.velocity.x).normalize();
                ball.mesh.rotateOnWorldAxis(axis, speed * deltaTime);
            }
        });
    }

    /**
     * Update animations - simplified, no complex shaders
     */
    updateAnimations() {
        const time = this.clock.getElapsedTime();
        const deltaTime = this.clock.getDelta();

        // Animate flowers (gentle bobbing)
        this.flowers.forEach(flower => {
            flower.mesh.position.y = flower.baseY + Math.sin(time * flower.speed + flower.offset) * 0.1;
            flower.mesh.rotation.z = Math.sin(time * flower.speed + flower.offset) * 0.1;
        });

        // Animate butterflies (figure-8 pattern)
        this.butterflies.forEach(butterfly => {
            butterfly.phase += butterfly.speed * 0.02;

            butterfly.mesh.position.x = butterfly.center.x + Math.sin(butterfly.phase) * butterfly.radius;
            butterfly.mesh.position.z = butterfly.center.z + Math.cos(butterfly.phase * 2) * butterfly.radius * 0.5;
            butterfly.mesh.position.y = butterfly.center.y + Math.sin(time * 2 + butterfly.phase) * 1;

            // Wing flapping
            const flapAngle = Math.sin(time * 10) * 0.5;
            butterfly.leftWing.rotation.y = Math.PI / 4 + flapAngle;
            butterfly.rightWing.rotation.y = -Math.PI / 4 - flapAngle;

            // Face direction
            butterfly.mesh.rotation.y = butterfly.phase;
        });

        // Animate floating lights
        this.floatingLights.forEach(light => {
            light.mesh.position.y = light.baseY + Math.sin(time * light.speed + light.phase) * 0.8;
            light.mesh.rotation.y = time * 0.5;

            // Pulsing glow
            const pulse = 0.8 + Math.sin(time * 2 + light.phase) * 0.2;
            light.mesh.material.emissiveIntensity = pulse;
        });

        // Rotate merry-go-rounds
        this.windmills.forEach(windmill => {
            windmill.mesh.rotation.y += windmill.speed * 0.01;
        });

        // Animate fountain water
        if (this.fountain) {
            this.fountain.children.forEach((child, index) => {
                if (child.userData.phase !== undefined) {
                    const phase = time * child.userData.speed + child.userData.phase;
                    child.position.y = 2.5 + Math.sin(phase) * 1.5;
                    child.position.x = Math.sin(phase * 0.5) * child.userData.radius;
                    child.position.z = Math.cos(phase * 0.5) * child.userData.radius;

                    // Fade out at bottom
                    const alpha = Math.max(0, Math.min(1, (child.position.y - 1) / 2));
                    child.material.opacity = alpha * 0.8;
                }
            });
        }

        // Update balls
        this.updateBalls(deltaTime);

        // Update walking character
        this.updateCharacter(time);

        // Handle animating objects (swings, seesaw)
        this.animatingObjects.forEach((data, object) => {
            if (data.type === 'swing') {
                if (!data.startTime) data.startTime = time;
                const elapsed = time - data.startTime;
                object.rotation.x = Math.sin(elapsed * 3) * 0.5;

                if (elapsed > 5) {
                    object.rotation.x = 0;
                    this.animatingObjects.delete(object);
                }
            } else if (data.type === 'seesaw') {
                if (!data.startTime) data.startTime = time;
                const elapsed = time - data.startTime;
                object.children[1].rotation.z = Math.sin(elapsed * 2) * 0.3;

                if (elapsed > 6) {
                    object.children[1].rotation.z = 0;
                    this.animatingObjects.delete(object);
                }
            }
        });
    }

    /**
     * Main update loop
     */
    update() {
        this.controls.update();
        this.updateAnimations();
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Render scene
     */
    render() {
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Get scene for external use
     */
    getScene() {
        return this.scene;
    }

    /**
     * Get camera for external use
     */
    getCamera() {
        return this.camera;
    }

    /**
     * Get renderer for external use
     */
    getRenderer() {
        return this.renderer;
    }
}
