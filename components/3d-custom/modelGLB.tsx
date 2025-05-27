"use client"

import * as React from "react"
import { useFrame } from '@react-three/fiber';
import { useGLTF, Text } from '@react-three/drei';
import { useCustomizationStore } from '../shared/client/stores/customization';
import * as THREE from 'three';
import { CakeConfig } from '@/types/cake';
import { CartItem } from "@/types/cart";

interface ModelGLBProps {
    modelPath?: string;
    config: CakeConfig;
    addToCart: (config: CakeConfig) => void;
    editCartItem: (id: string, newConfig: CakeConfig) => void;
    items: CartItem[];
}

export function ModelGLB({ modelPath = '/cake3.glb', config, addToCart, editCartItem, items }: ModelGLBProps) {
    const meshRef = React.useRef<THREE.Group>(null!);
    const { scene } = useGLTF(modelPath);
    const {
        colors,
        customizedParts,
        selectedPart,
        scale,
        animationSpeed,
        isPlaying,
        setSelectedPart,
        setColorForPart,
        textures,
        texts,
        setClickPosition,
        roughness,
        metalness
    } = useCustomizationStore();

    const [originalMaterials] = React.useState<Map<string, THREE.Material>>(new Map());
    const [hovered, setHovered] = React.useState<string | null>(null);
    const [loadedTextures, setLoadedTextures] = React.useState<Map<string, THREE.Texture>>(new Map());
    const [rotation, setRotation] = React.useState(0);
    const [initialLoad, setInitialLoad] = React.useState(true);

    // Initialize materials for each part of the cake
    React.useEffect(() => {
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // Set initial materials based on config
                const material = new THREE.MeshStandardMaterial({
                    metalness: 0.1,
                    roughness: 0.3,
                    side: THREE.DoubleSide,
                });

                // Map mesh names to config properties
                switch (child.name.toLowerCase()) {
                    case 'cake':
                    case 'sponge':
                        material.color.set(
                            config.sponge === 'vanilla' ? '#f5f5dc' :
                                config.sponge === 'chocolate' ? '#3c1321' :
                                    config.sponge === 'red-velvet' ? '#8b0000' : '#f5f5dc'
                        );
                        break;
                    case 'frosting':
                    case 'icing':
                    // case 'buttercream':
                    //     material.color.set(
                    //         config.outerIcing === 'pink-vanilla' ? '#ffb6c1' :
                    //             config.outerIcing === 'white-vanilla' ? '#ffffff' :
                    //                 config.outerIcing === 'blue-vanilla' ? '#87ceeb' :
                    //                     config.outerIcing === 'yellow-vanilla' ? '#ffd700' : '#ffffff'
                    //     );
                    //     break;
                    case 'board':
                    case 'base':
                        material.color.set(
                            config.board === 'white' ? '#ffffff' :
                                config.board === 'pink' ? '#ffb6c1' :
                                    config.board === 'blue' ? '#87ceeb' : '#ffffff'
                        );
                        break;
                }

                child.material = material;
            }
        });
    }, [scene, config]);

    // Save original materials on first load and initialize colors
    React.useEffect(() => {
        const initialColors: Record<string, string> = {};

        scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
                if (!originalMaterials.has(child.uuid)) {
                    originalMaterials.set(child.uuid, child.material.clone());

                    // Extract the original color if it's a standard material
                    if (child.material instanceof THREE.MeshStandardMaterial && child.name) {
                        const color = child.material.color.getHexString();
                        initialColors[child.name] = `#${color}`;
                    }
                }
            }
        });

        // Initialize store with original colors if they haven't been customized
        if (initialLoad) {
            Object.entries(initialColors).forEach(([partName, color]) => {
                if (!customizedParts.includes(partName)) {
                    setColorForPart(partName, color, false);
                }
            });
            setInitialLoad(false);
        }
    }, [scene, initialLoad, setColorForPart, customizedParts, originalMaterials]);

    // Implement rotation animation using useFrame
    useFrame((_, delta) => {
        if (isPlaying && meshRef.current) {
            setRotation((prev) => prev + delta * animationSpeed);
            meshRef.current.rotation.y = rotation;
        }
    });

    // Enhanced texture loading
    React.useEffect(() => {
        const textureLoader = new THREE.TextureLoader();

        const loadTexture = async (textureUrl: string) => {
            return new Promise<THREE.Texture>((resolve, reject) => {
                textureLoader.load(
                    textureUrl,
                    (texture) => {
                        texture.colorSpace = THREE.SRGBColorSpace;
                        texture.flipY = false;
                        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                        texture.needsUpdate = true;
                        resolve(texture);
                    },
                    undefined,
                    reject
                );
            });
        };

        Object.entries(textures).forEach(async ([_, config]) => {
            try {
                const texture = await loadTexture(config.texture);
                setLoadedTextures(prev => new Map(prev).set(config.texture, texture));
            } catch (error) {
                console.error('Failed to load texture:', config.texture, error);
            }
        });

        return () => {
            loadedTextures.forEach(texture => texture.dispose());
        };
    }, [textures, loadedTextures]);

    // Update materials with colors and textures
    React.useEffect(() => {
        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const originalMaterial = originalMaterials.get(child.uuid);
                if (originalMaterial && originalMaterial instanceof THREE.MeshStandardMaterial) {
                    const newMaterial = new THREE.MeshStandardMaterial();

                    // Basic material properties
                    newMaterial.transparent = true;
                    newMaterial.side = THREE.DoubleSide;
                    newMaterial.roughness = roughness;
                    newMaterial.metalness = metalness;
                    newMaterial.needsUpdate = true;

                    // Apply colors based on cake config
                    if (child.name === 'sponge') {
                        // Sponge colors
                        newMaterial.color.set(
                            config.sponge === 'vanilla' ? '#f5f5dc' :
                                config.sponge === 'chocolate' ? '#3c1321' :
                                    config.sponge === 'red-velvet' ? '#8b0000' :
                                        config.sponge === 'salted-caramel' ? '#d2691e' :
                                            config.sponge === 'raspberry-ripple' ? '#ff69b4' :
                                                config.sponge === 'lemon' ? '#ffd700' :
                                                    config.sponge === 'rainbow' ? '#ffffff' :
                                                        config.sponge === 'funfetti' ? '#ffffff' : '#f5f5dc'
                        );
                    } else if (child.name === 'outerIcing') {
                        // Outer icing colors
                        // newMaterial.color.set(
                        //     config.outerIcing === 'pink-vanilla' ? '#ffb6c1' :
                        //         config.outerIcing === 'white-vanilla' ? '#ffffff' :
                        //             config.outerIcing === 'blue-vanilla' ? '#87ceeb' :
                        //                 config.outerIcing === 'yellow-vanilla' ? '#ffd700' : '#ffffff'
                        // );
                    } else if (child.name === 'filling') {
                        // Filling colors
                        newMaterial.color.set(
                            config.filling === 'white-vanilla' ? '#ffffff' :
                                config.filling === 'pink-vanilla' ? '#ffb6c1' :
                                    config.filling === 'blue-vanilla' ? '#87ceeb' :
                                        config.filling === 'yellow-vanilla' ? '#ffd700' :
                                            config.filling === 'cream-cheese' ? '#f0f8ff' :
                                                config.filling === 'chocolate' ? '#3c1321' :
                                                    config.filling === 'salted-caramel' ? '#d2691e' :
                                                        config.filling === 'raspberry' ? '#ff69b4' : '#ffffff'
                        );
                    } else if (child.name === 'board') {
                        // Cake board colors
                        newMaterial.color.set(
                            config.board === 'white' ? '#ffffff' :
                                config.board === 'pink' ? '#ffb6c1' :
                                    config.board === 'blue' ? '#87ceeb' : '#ffffff'
                        );
                    } else if (child.name === 'candles') {
                        // Candle colors
                        if (config.candles) {
                            newMaterial.color.set(
                                config.candles === 'pink-candles' ? '#ffb6c1' :
                                    config.candles === 'blue-candles' ? '#87ceeb' :
                                        config.candles === 'white-candles' ? '#ffffff' : '#ffffff'
                            );
                        } else {
                            newMaterial.visible = false;
                        }
                    } else if (child.name === 'toppings') {
                        // Handle toppings visibility
                        newMaterial.visible = Array.isArray(config.extras) && config.extras.length > 0;
                        if (Array.isArray(config.extras) && config.extras.length > 0) {
                            // Apply topping colors based on selected extras
                            const toppingColor = new THREE.Color();
                            config.extras.forEach(extra => {
                                switch (extra) {
                                    case 'cookie-dough':
                                        toppingColor.set('#d2691e');
                                        break;
                                    case 'caramelised-white':
                                        toppingColor.set('#f5f5dc');
                                        break;
                                    case 'oreo-crumbs':
                                        toppingColor.set('#000000');
                                        break;
                                    case 'biscoff-crumbs':
                                        toppingColor.set('#d2691e');
                                        break;
                                    case 'malted-cornflakes':
                                        toppingColor.set('#ffd700');
                                        break;
                                    case 'pinata':
                                        toppingColor.set('#ff69b4');
                                        break;
                                }
                            });
                            newMaterial.color.copy(toppingColor);
                        }
                    }

                    // Apply texture
                    const textureConfig = textures[child.name];
                    if (textureConfig && loadedTextures.has(textureConfig.texture)) {
                        const texture = loadedTextures.get(textureConfig.texture)!.clone();
                        texture.repeat.set(textureConfig.repeat, textureConfig.repeat);
                        texture.rotation = textureConfig.rotation * Math.PI / 180;
                        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                        texture.needsUpdate = true;
                        newMaterial.map = texture;
                        newMaterial.needsUpdate = true;
                    }

                    // Apply selection/hover effects
                    if (selectedPart === child.name) {
                        newMaterial.emissive.set('#444444');
                    } else if (hovered === child.name) {
                        newMaterial.emissive.set('#222222');
                    } else {
                        newMaterial.emissive.set('#000000');
                    }

                    // Assign new material
                    child.material = newMaterial;
                }
            }
        });
    }, [colors, selectedPart, hovered, originalMaterials, textures, loadedTextures, roughness, metalness, scene, config]);

    return (
        <group
            ref={meshRef}
            scale={[scale, scale, scale]}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(e.object.name);
                document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
                e.stopPropagation();
                setHovered(null);
                document.body.style.cursor = 'auto';
            }}
            onClick={(e) => {
                e.stopPropagation();
                setSelectedPart(e.object.name);
                const clickPosition = {
                    x: e.point.x,
                    y: e.point.y,
                    z: e.point.z
                };
                setClickPosition(clickPosition);
            }}
        >
            <primitive object={scene} />

            {/* Render text elements for messages */}
            {config.messageType === 'piped' && config.message && (
                <Text
                    position={[0, 0, 0]}
                    rotation={[0, 0, 0]}
                    fontSize={0.5}
                    color={config.plaqueColor === 'white' ? '#ffffff' :
                        config.plaqueColor === 'dark' ? '#000000' :
                            config.plaqueColor === 'pink' ? '#ffb6c1' :
                                config.plaqueColor === 'blue' ? '#87ceeb' : '#ffffff'}
                    anchorX="center"
                    anchorY="middle"
                    renderOrder={10}
                >
                    {config.message}
                </Text>
            )}

            {/* Render edible image if selected */}
            {config.messageType === 'edible' && config.uploadedImage && (
                <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[1, 1]} />
                    <meshBasicMaterial
                        map={new THREE.TextureLoader().load(config.uploadedImage)}
                        transparent
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}
        </group>
    );
}