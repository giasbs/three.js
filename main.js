import * as THREE from 'three';
import { PlaygroundScene } from './playgroundScene.js';

/**
 * Main application controller
 * Handles user interactions, raycasting, animations, and UI
 */
class PlaygroundApp {
    constructor() {
        this.playgroundScene = new PlaygroundScene();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredObject = null;
        this.clickedObject = null;
        this.particles = [];
        this.audioContext = null;
        this.audioPlaying = false;
        this.oscillators = [];

        // Camera viewpoints for different zones
        this.cameraViewpoints = {
            overview: { position: { x: 25, y: 15, z: 25 }, target: { x: 0, y: 0, z: 0 } },
            garden: { position: { x: -15, y: 8, z: -15 }, target: { x: -8, y: 2, z: -8 } },
            playArea: { position: { x: 10, y: 8, z: 0 }, target: { x: 6, y: 2, z: 0 } },
            relaxZone: { position: { x: 0, y: 6, z: -15 }, target: { x: 0, y: 1, z: -10 } }
        };

        this.isTransitioning = false;

        // Focus mode properties
        this.focusMode = false;
        this.savedCameraPosition = null;
        this.savedCameraTarget = null;
        this.cameraDistance = 10; // Distance behind character
        this.cameraHeight = 4; // Height above ground
        this.cameraRotation = 0; // Rotation around character (degrees)

        // WASD movement keys
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            q: false, // Rotate camera left
            e: false  // Rotate camera right
        };

        this.init();
        this.setupEventListeners();
        this.animate();
    }

    /**
     * Initialize the application
     */
    init() {
        // Show loading complete
        this.hideLoader();

        // Create particle system for effects
        this.createParticleSystem();
    }

    /**
     * Hide the loading screen
     */
    hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }, 1000);
        }
    }

    /**
     * Set up all event listeners for mouse, keyboard, and UI
     */
    setupEventListeners() {
        // Mouse move for raycasting
        window.addEventListener('mousemove', this.onMouseMove.bind(this));

        // Click for interactions
        window.addEventListener('click', this.onClick.bind(this));

        // Window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // UI buttons
        const overviewBtn = document.getElementById('overview-btn');
        const gardenBtn = document.getElementById('garden-btn');
        const playAreaBtn = document.getElementById('play-area-btn');
        const relaxBtn = document.getElementById('relax-btn');
        const soundToggle = document.getElementById('sound-toggle');

        if (overviewBtn) overviewBtn.addEventListener('click', () => this.moveCamera('overview'));
        if (gardenBtn) gardenBtn.addEventListener('click', () => this.moveCamera('garden'));
        if (playAreaBtn) playAreaBtn.addEventListener('click', () => this.moveCamera('playArea'));
        if (relaxBtn) relaxBtn.addEventListener('click', () => this.moveCamera('relaxZone'));
        if (soundToggle) soundToggle.addEventListener('click', this.toggleSound.bind(this));

        // Keyboard navigation
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));

        // Mouse wheel for zoom in focus mode
        window.addEventListener('wheel', this.onMouseWheel.bind(this));
    }

    /**
     * Handle mouse movement for raycasting
     */
    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.updateHover();
    }

    /**
     * Update hover state using raycasting
     */
    updateHover() {
        this.raycaster.setFromCamera(this.mouse, this.playgroundScene.getCamera());
        const intersects = this.raycaster.intersectObjects(
            this.playgroundScene.interactiveObjects,
            true
        );

        // Reset previous hover
        if (this.hoveredObject) {
            this.resetObjectHover(this.hoveredObject);
            this.hoveredObject = null;
            document.body.style.cursor = 'default';
        }

        // Apply new hover
        if (intersects.length > 0) {
            let object = intersects[0].object;

            // Find the parent interactive object
            while (object && !object.userData.interactive) {
                object = object.parent;
            }

            if (object && object.userData.interactive) {
                this.hoveredObject = object;
                this.applyObjectHover(object);
                document.body.style.cursor = 'pointer';
            }
        }
    }

    /**
     * Apply hover effect to an object
     */
    applyObjectHover(object) {
        const type = object.userData.type;

        switch (type) {
            case 'tree':
                // Gentle sway
                object.userData.hoverTime = 0;
                object.userData.originalRotation = object.rotation.y;
                break;

            case 'flower':
                // Grow slightly
                object.userData.isHovered = true;
                this.animateScale(object, 1.2, 300);
                break;

            case 'swing':
                // Highlight the seat with warm glow
                if (object.userData.swingSeat) {
                    object.userData.swingSeat.material.emissive.setHex(0xff6347);
                    object.userData.swingSeat.material.emissiveIntensity = 0.3;
                }
                break;

            case 'slide':
                // Enhanced glow effect with rim lighting
                if (object.userData.slideMaterial) {
                    object.userData.slideMaterial.emissive.setHex(0xff1493);
                    object.userData.slideMaterial.emissiveIntensity = 0.4;
                }
                break;

            case 'lamp':
                // Enhanced pulse effect
                if (object.userData.lampMaterial) {
                    object.userData.lampMaterial.emissive.setHex(0xffa500);
                    object.userData.lampMaterial.emissiveIntensity = 0.4;
                }
                break;

            case 'sandbox':
            case 'bench':
                // Subtle highlight on hover
                object.traverse(child => {
                    if (child.isMesh && child.material) {
                        child.userData.originalEmissive = child.material.emissive ? child.material.emissive.getHex() : 0x000000;
                        if (child.material.emissive) {
                            child.material.emissive.setHex(0x222211);
                        }
                    }
                });
                break;
        }
    }

    /**
     * Reset hover effect on an object
     */
    resetObjectHover(object) {
        const type = object.userData.type;

        switch (type) {
            case 'tree':
                // Reset rotation
                if (object.userData.originalRotation !== undefined) {
                    object.rotation.y = object.userData.originalRotation;
                }
                break;

            case 'flower':
                // Return to original size
                object.userData.isHovered = false;
                this.animateScale(object, 1.0, 300);
                break;

            case 'swing':
                // Remove highlight
                if (object.userData.swingSeat) {
                    object.userData.swingSeat.material.emissive.setHex(0x000000);
                    object.userData.swingSeat.material.emissiveIntensity = 0;
                }
                break;

            case 'slide':
                // Remove glow
                if (object.userData.slideMaterial) {
                    object.userData.slideMaterial.emissive.setHex(0x000000);
                    object.userData.slideMaterial.emissiveIntensity = 0;
                }
                break;

            case 'lamp':
                // Remove pulse
                if (object.userData.lampMaterial && !object.userData.isOn) {
                    object.userData.lampMaterial.emissive.setHex(0x000000);
                    object.userData.lampMaterial.emissiveIntensity = 0;
                }
                break;

            case 'sandbox':
            case 'bench':
                // Remove highlight
                object.traverse(child => {
                    if (child.isMesh && child.material && child.material.emissive) {
                        const originalEmissive = child.userData.originalEmissive || 0x000000;
                        child.material.emissive.setHex(originalEmissive);
                    }
                });
                break;
        }
    }

    /**
     * Handle click events
     */
    onClick(event) {
        // Don't process clicks on UI elements
        if (event.target.closest('.ui-overlay')) return;

        this.raycaster.setFromCamera(this.mouse, this.playgroundScene.getCamera());
        const intersects = this.raycaster.intersectObjects(
            this.playgroundScene.interactiveObjects,
            true
        );

        if (intersects.length > 0) {
            let object = intersects[0].object;

            // Find the parent interactive object
            while (object && !object.userData.interactive) {
                object = object.parent;
            }

            if (object && object.userData.interactive) {
                this.handleObjectClick(object, intersects[0].point);
            }
        }
    }

    /**
     * Handle click on an interactive object
     */
    handleObjectClick(object, point) {
        const type = object.userData.type;

        switch (type) {
            case 'swing':
                // Start swinging animation
                if (!this.playgroundScene.animatingObjects.has(object)) {
                    this.playgroundScene.animatingObjects.set(object, { type: 'swing' });
                } else {
                    this.playgroundScene.animatingObjects.delete(object);
                }
                break;

            case 'slide':
                // Trigger particle effect at the base
                this.createConfetti(new THREE.Vector3(
                    object.position.x,
                    0.5,
                    object.position.z + 3
                ));
                break;

            case 'lamp':
                // Toggle lamp on/off
                this.toggleLamp(object);
                break;

            case 'tree':
                // Rustle the tree
                this.rustleTree(object);
                break;

            case 'flower':
                // Make flower dance
                this.danceFlower(object);
                break;

            case 'ball':
                // Kick the ball
                this.kickBall(object, point);
                break;

            case 'seesaw':
                // Rock the seesaw
                if (!this.playgroundScene.animatingObjects.has(object)) {
                    this.playgroundScene.animatingObjects.set(object, { type: 'seesaw' });
                } else {
                    this.playgroundScene.animatingObjects.delete(object);
                }
                break;

            case 'house':
                // Make windows glow
                this.animateHouse(object);
                break;

            case 'board':
                // Animate board highlight
                this.animateBoard(object);
                break;

            case 'character':
                // Toggle bubble visibility
                this.toggleCharacterBubble();
                break;

            case 'bubble':
                // Toggle focus mode
                this.toggleFocusMode();
                break;
        }
    }

    /**
     * Animate object scale
     */
    animateScale(object, targetScale, duration) {
        const startScale = object.scale.x;
        const startTime = performance.now();

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeInOutCubic(progress);

            const scale = startScale + (targetScale - startScale) * eased;
            object.scale.set(scale, scale, scale);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    /**
     * Toggle lamp on/off
     */
    toggleLamp(lamp) {
        const isOn = lamp.userData.isOn;
        const lampMaterial = lamp.userData.lampMaterial;
        const pointLight = lamp.userData.pointLight;

        if (!isOn) {
            // Turn on
            lampMaterial.emissive.setHex(0xffa500);
            lampMaterial.emissiveIntensity = 0.8;
            pointLight.intensity = 1.5;
            lamp.userData.isOn = true;
        } else {
            // Turn off
            lampMaterial.emissive.setHex(0x000000);
            lampMaterial.emissiveIntensity = 0;
            pointLight.intensity = 0;
            lamp.userData.isOn = false;
        }
    }

    /**
     * Make tree rustle
     */
    rustleTree(tree) {
        const startTime = performance.now();
        const duration = 1000;
        const originalRotation = tree.rotation.y;

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = elapsed / duration;

            if (progress < 1) {
                tree.rotation.y = originalRotation + Math.sin(progress * Math.PI * 8) * 0.1;
                requestAnimationFrame(animate);
            } else {
                tree.rotation.y = originalRotation;
            }
        };

        animate();
    }

    /**
     * Make flower dance
     */
    danceFlower(flower) {
        const startTime = performance.now();
        const duration = 1500;

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = elapsed / duration;

            if (progress < 1) {
                const rotation = Math.sin(progress * Math.PI * 6) * 0.2;
                flower.rotation.z = rotation;
                requestAnimationFrame(animate);
            } else {
                flower.rotation.z = 0;
            }
        };

        animate();
    }

    /**
     * Animate house windows glow
     */
    animateHouse(house) {
        const windows = house.children.filter(child =>
            child.geometry && child.geometry.type === 'BoxGeometry' &&
            child.material.transparent
        );

        const startTime = performance.now();
        const duration = 2000;

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = elapsed / duration;

            if (progress < 1) {
                const glow = 0.3 + Math.sin(progress * Math.PI * 4) * 0.5;
                windows.forEach(window => {
                    window.material.emissiveIntensity = glow;
                });
                requestAnimationFrame(animate);
            } else {
                windows.forEach(window => {
                    window.material.emissiveIntensity = 0.3;
                });
            }
        };

        animate();
    }

    /**
     * Animate board highlight when clicked
     */
    animateBoard(board) {
        // Find the main board surface (the mesh with the canvas texture)
        const boardSurface = board.children.find(child =>
            child.geometry && child.geometry.type === 'BoxGeometry' &&
            child.material.map && child.userData.type !== 'frame'
        );

        if (!boardSurface) return;

        const startTime = performance.now();
        const duration = 1500;
        const originalEmissive = boardSurface.material.emissive ? boardSurface.material.emissive.clone() : new THREE.Color(0x000000);
        const originalIntensity = boardSurface.material.emissiveIntensity || 0;

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = elapsed / duration;

            if (progress < 1) {
                // Pulsing highlight effect
                const pulse = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5;

                // Set emissive to white with pulsing intensity
                boardSurface.material.emissive = new THREE.Color(0xffffff);
                boardSurface.material.emissiveIntensity = pulse * 0.3;

                requestAnimationFrame(animate);
            } else {
                // Reset to original
                boardSurface.material.emissive = originalEmissive;
                boardSurface.material.emissiveIntensity = originalIntensity;
            }
        };

        animate();

        // Console log for future functionality
        console.log(`Board clicked: ${board.userData.name}`);
        console.log('Canvas available for updates:', board.userData.canvas);
    }

    /**
     * Toggle character bubble visibility
     */
    toggleCharacterBubble() {
        if (!this.playgroundScene.character) return;

        const char = this.playgroundScene.character;
        char.bubbleVisible = !char.bubbleVisible;
        char.bubble.visible = char.bubbleVisible;

        // Quick scale animation for feedback
        const startScale = 1;
        const targetScale = 1.15;
        const startTime = performance.now();
        const duration = 200;

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            if (progress < 1) {
                const scale = startScale + (targetScale - startScale) * Math.sin(progress * Math.PI);
                char.group.scale.set(scale, scale, scale);
                requestAnimationFrame(animate);
            } else {
                char.group.scale.set(1, 1, 1);
            }
        };

        animate();

        console.log(`Bubble ${char.bubbleVisible ? 'SHOWN' : 'HIDDEN'}`);
    }

    /**
     * Toggle focus mode
     */
    toggleFocusMode() {
        if (!this.playgroundScene.character) return;

        this.focusMode = !this.focusMode;
        const char = this.playgroundScene.character;
        const controls = this.playgroundScene.getControls();

        if (this.focusMode) {
            // Entering focus mode
            char.focusMode = true;
            char.paused = true;

            // Save current camera state
            this.savedCameraPosition = this.playgroundScene.getCamera().position.clone();
            this.savedCameraTarget = controls.target.clone();

            // Disable OrbitControls
            controls.enabled = false;

            // Reset camera rotation
            this.cameraRotation = 0;

            // Set initial camera position (simple: directly behind and above character)
            const camera = this.playgroundScene.getCamera();
            const charPos = char.group.position;

            camera.position.set(
                charPos.x,
                charPos.y + this.cameraHeight,
                charPos.z + this.cameraDistance
            );

            // Look at character's upper body
            camera.lookAt(charPos.x, charPos.y + 1.5, charPos.z);

            console.log('FOCUS MODE ACTIVATED');
            console.log('Camera at:', camera.position.x.toFixed(2), camera.position.y.toFixed(2), camera.position.z.toFixed(2));
            console.log('Looking at:', charPos.x.toFixed(2), charPos.y.toFixed(2), charPos.z.toFixed(2));
            console.log('Controls:', 'WASD=move, Q/E=rotate camera, Mouse Wheel=zoom');
        } else {
            // Exiting focus mode
            char.focusMode = false;
            char.paused = false; // Resume walking

            // Restore camera position
            if (this.savedCameraPosition && this.savedCameraTarget) {
                const camera = this.playgroundScene.getCamera();
                const duration = 1000;
                const startPos = camera.position.clone();
                const startTarget = controls.target.clone();
                const startTime = performance.now();

                const animate = () => {
                    const elapsed = performance.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = this.easeInOutCubic(progress);

                    camera.position.lerpVectors(startPos, this.savedCameraPosition, eased);
                    controls.target.lerpVectors(startTarget, this.savedCameraTarget, eased);

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        // Re-enable OrbitControls after transition
                        controls.enabled = true;
                        controls.update();
                    }
                };

                animate();
            } else {
                controls.enabled = true;
            }

            console.log('FOCUS MODE DEACTIVATED - Character resumed walking');
        }
    }

    /**
     * Kick a ball in the direction away from camera
     */
    kickBall(ball, clickPoint) {
        // Calculate kick direction from camera to ball
        const ballPosition = ball.position.clone();
        const cameraPosition = this.playgroundScene.getCamera().position.clone();
        cameraPosition.y = 0; // Project to ground level
        ballPosition.y = 0;

        // Direction from camera to ball (normalized)
        const kickDirection = new THREE.Vector3()
            .subVectors(ballPosition, cameraPosition)
            .normalize();

        // Call the playground scene's kickBall method
        this.playgroundScene.kickBall(ball, kickDirection);
    }

    /**
     * Create particle system
     */
    createParticleSystem() {
        const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const particleMaterials = [
            new THREE.MeshBasicMaterial({ color: 0xff69b4 }),
            new THREE.MeshBasicMaterial({ color: 0xffff00 }),
            new THREE.MeshBasicMaterial({ color: 0x00ffff }),
            new THREE.MeshBasicMaterial({ color: 0xff00ff }),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        ];

        for (let i = 0; i < 30; i++) {
            const material = particleMaterials[i % particleMaterials.length];
            const particle = new THREE.Mesh(particleGeometry, material);
            particle.visible = false;
            this.particles.push(particle);
            this.playgroundScene.getScene().add(particle);
        }
    }

    /**
     * Create confetti effect
     */
    createConfetti(position) {
        const activeParticles = [];

        this.particles.forEach((particle, index) => {
            if (!particle.visible) {
                particle.position.copy(position);
                particle.visible = true;

                // Random velocity
                const velocity = new THREE.Vector3(
                    (Math.random() - 0.5) * 4,
                    Math.random() * 5 + 3,
                    (Math.random() - 0.5) * 4
                );

                activeParticles.push({
                    particle,
                    velocity,
                    life: 1.0
                });
            }
        });

        // Animate particles
        const animateParticles = () => {
            let allDead = true;

            activeParticles.forEach(p => {
                if (p.life > 0) {
                    allDead = false;

                    // Update position
                    p.particle.position.add(p.velocity.clone().multiplyScalar(0.016));

                    // Apply gravity
                    p.velocity.y -= 0.2;

                    // Fade out
                    p.life -= 0.02;
                    p.particle.material.opacity = p.life;

                    if (p.life <= 0) {
                        p.particle.visible = false;
                    }
                }
            });

            if (!allDead) {
                requestAnimationFrame(animateParticles);
            } else {
                // Reset particles
                activeParticles.forEach(p => {
                    p.particle.visible = false;
                    p.particle.material.opacity = 1.0;
                });
            }
        };

        animateParticles();
    }

    /**
     * Move camera to a specific viewpoint
     */
    moveCamera(viewpointName) {
        if (this.isTransitioning) return;

        const viewpoint = this.cameraViewpoints[viewpointName];
        if (!viewpoint) return;

        this.isTransitioning = true;

        const camera = this.playgroundScene.getCamera();
        const controls = this.playgroundScene.getControls();

        const startPos = camera.position.clone();
        const endPos = new THREE.Vector3(viewpoint.position.x, viewpoint.position.y, viewpoint.position.z);
        const startTarget = controls.target.clone();
        const endTarget = new THREE.Vector3(viewpoint.target.x, viewpoint.target.y, viewpoint.target.z);

        const duration = 1500;
        const startTime = performance.now();

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeInOutCubic(progress);

            // Interpolate position
            camera.position.lerpVectors(startPos, endPos, eased);
            controls.target.lerpVectors(startTarget, endTarget, eased);
            controls.update();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isTransitioning = false;
            }
        };

        animate();
    }

    /**
     * Format object name for display
     */
    formatName(name) {
        return name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Toggle ambient sound
     */
    toggleSound() {
        const soundToggle = document.getElementById('sound-toggle');

        if (!this.audioPlaying) {
            this.startAmbientSound();
            if (soundToggle) {
                soundToggle.textContent = '🔊 Sound On';
                soundToggle.setAttribute('aria-label', 'Turn off ambient sound');
            }
            this.audioPlaying = true;
        } else {
            this.stopAmbientSound();
            if (soundToggle) {
                soundToggle.textContent = '🔇 Sound Off';
                soundToggle.setAttribute('aria-label', 'Turn on ambient sound');
            }
            this.audioPlaying = false;
        }
    }

    /**
     * Start ambient sound (birds chirping simulation)
     */
    startAmbientSound() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Create gentle wind sound using pink noise
        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.05;
            b6 = white * 0.115926;
        }

        const whiteNoise = this.audioContext.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const windGain = this.audioContext.createGain();
        windGain.gain.value = 0.03;

        whiteNoise.connect(windGain);
        windGain.connect(this.audioContext.destination);
        whiteNoise.start();

        this.oscillators.push({ source: whiteNoise, gain: windGain });

        // Create occasional bird chirps using oscillators
        this.birdChirpInterval = setInterval(() => {
            this.playBirdChirp();
        }, Math.random() * 3000 + 2000);
    }

    /**
     * Play a bird chirp sound
     */
    playBirdChirp() {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = 1000 + Math.random() * 1000;

        gainNode.gain.value = 0.1;

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const now = this.audioContext.currentTime;
        oscillator.frequency.exponentialRampToValueAtTime(
            oscillator.frequency.value * 1.5,
            now + 0.1
        );
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        oscillator.start(now);
        oscillator.stop(now + 0.2);
    }

    /**
     * Stop ambient sound
     */
    stopAmbientSound() {
        this.oscillators.forEach(osc => {
            if (osc.source) {
                osc.source.stop();
            }
        });
        this.oscillators = [];

        if (this.birdChirpInterval) {
            clearInterval(this.birdChirpInterval);
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }

    /**
     * Handle keyboard input
     */
    onKeyDown(event) {
        // Handle WASD + QE for focus mode
        if (this.focusMode) {
            switch (event.key.toLowerCase()) {
                case 'w':
                    this.keys.w = true;
                    break;
                case 'a':
                    this.keys.a = true;
                    break;
                case 's':
                    this.keys.s = true;
                    break;
                case 'd':
                    this.keys.d = true;
                    break;
                case 'q':
                    this.keys.q = true;
                    break;
                case 'e':
                    this.keys.e = true;
                    break;
            }
        } else {
            // Normal camera shortcuts
            switch (event.key) {
                case '1':
                    this.moveCamera('overview');
                    break;
                case '2':
                    this.moveCamera('garden');
                    break;
                case '3':
                    this.moveCamera('playArea');
                    break;
                case '4':
                    this.moveCamera('relaxZone');
                    break;
            }
        }
    }

    /**
     * Handle keyboard key release
     */
    onKeyUp(event) {
        if (this.focusMode) {
            switch (event.key.toLowerCase()) {
                case 'w':
                    this.keys.w = false;
                    break;
                case 'a':
                    this.keys.a = false;
                    break;
                case 's':
                    this.keys.s = false;
                    break;
                case 'd':
                    this.keys.d = false;
                    break;
                case 'q':
                    this.keys.q = false;
                    break;
                case 'e':
                    this.keys.e = false;
                    break;
            }
        }
    }

    /**
     * Handle mouse wheel for zoom in focus mode
     */
    onMouseWheel(event) {
        if (!this.focusMode) return;

        event.preventDefault();

        // Adjust camera distance
        const zoomSpeed = 0.5;
        this.cameraDistance += event.deltaY * 0.01 * zoomSpeed;

        // Clamp distance between 2 and 15 units
        this.cameraDistance = Math.max(2, Math.min(15, this.cameraDistance));
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        this.playgroundScene.handleResize();
    }

    /**
     * Easing function
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Update focus mode (character movement and camera)
     */
    updateFocusMode() {
        if (!this.focusMode || !this.playgroundScene.character) return;

        const char = this.playgroundScene.character;
        const camera = this.playgroundScene.getCamera();
        const charPos = char.group.position;

        const moveSpeed = 0.15;
        const rotateSpeed = 2; // degrees per frame

        // Rotate camera with Q/E
        if (this.keys.q) {
            this.cameraRotation += rotateSpeed;
        }
        if (this.keys.e) {
            this.cameraRotation -= rotateSpeed;
        }

        // Calculate movement direction
        let moveX = 0;
        let moveZ = 0;

        // Convert rotation to radians for calculation
        const rotRad = (this.cameraRotation) * (Math.PI / 180);

        if (this.keys.w) {
            moveX -= Math.sin(rotRad) * moveSpeed;
            moveZ -= Math.cos(rotRad) * moveSpeed;
        }
        if (this.keys.s) {
            moveX += Math.sin(rotRad) * moveSpeed;
            moveZ += Math.cos(rotRad) * moveSpeed;
        }
        if (this.keys.a) {
            moveX -= Math.cos(rotRad) * moveSpeed;
            moveZ += Math.sin(rotRad) * moveSpeed;
        }
        if (this.keys.d) {
            moveX += Math.cos(rotRad) * moveSpeed;
            moveZ -= Math.sin(rotRad) * moveSpeed;
        }

        // Move character
        if (moveX !== 0 || moveZ !== 0) {
            char.group.position.x += moveX;
            char.group.position.z += moveZ;

            // Bounds
            const maxBounds = 30;
            char.group.position.x = Math.max(-maxBounds, Math.min(maxBounds, char.group.position.x));
            char.group.position.z = Math.max(-maxBounds, Math.min(maxBounds, char.group.position.z));

            // Rotate character to face movement direction
            char.group.rotation.y = Math.atan2(moveX, moveZ);

            // Walking animation
            const time = performance.now() * 0.01;
            const swing = Math.sin(time * 8) * 0.4;
            char.leftArm.rotation.x = -swing;
            char.rightArm.rotation.x = swing;
            char.leftLeg.rotation.x = swing;
            char.rightLeg.rotation.x = -swing;
        } else {
            // Idle
            char.leftArm.rotation.x = 0;
            char.rightArm.rotation.x = 0;
            char.leftLeg.rotation.x = 0;
            char.rightLeg.rotation.x = 0;
        }

        // Update camera position - simple circular orbit
        const rotRadians = (this.cameraRotation) * (Math.PI / 180);
        const targetCameraX = charPos.x + Math.sin(rotRadians) * this.cameraDistance;
        const targetCameraY = charPos.y + this.cameraHeight;
        const targetCameraZ = charPos.z + Math.cos(rotRadians) * this.cameraDistance;

        // Smooth follow
        camera.position.x += (targetCameraX - camera.position.x) * 0.1;
        camera.position.y += (targetCameraY - camera.position.y) * 0.1;
        camera.position.z += (targetCameraZ - camera.position.z) * 0.1;

        // Always look at character
        camera.lookAt(charPos.x, charPos.y + 1.5, charPos.z);
    }

    /**
     * Main animation loop
     */
    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // Update hover effects for trees
        if (this.hoveredObject && this.hoveredObject.userData.type === 'tree') {
            this.hoveredObject.userData.hoverTime = (this.hoveredObject.userData.hoverTime || 0) + 0.05;
            this.hoveredObject.rotation.y = this.hoveredObject.userData.originalRotation +
                Math.sin(this.hoveredObject.userData.hoverTime) * 0.05;
        }

        // Update focus mode if active
        if (this.focusMode) {
            this.updateFocusMode();
        }

        // Update the playground scene
        this.playgroundScene.update();

        // Render the scene
        this.playgroundScene.getRenderer().render(
            this.playgroundScene.getScene(),
            this.playgroundScene.getCamera()
        );
    }
}

// Initialize the application when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new PlaygroundApp();
});
