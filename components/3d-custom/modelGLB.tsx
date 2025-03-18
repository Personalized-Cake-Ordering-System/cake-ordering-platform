"use client"

import * as React from "react"
import { useFrame } from '@react-three/fiber';
import { useGLTF, Text } from '@react-three/drei';
import { useCustomizationStore } from '../shared/client/stores/customization';
import * as THREE from 'three';

interface TextConfig {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    size: number;
    color: string;
    content: string;
}

export function ModelGLB({ modelPath = '/cake3.glb' }) {
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
                    setColorForPart(partName, color, false); // false = not a custom color
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
                        // Configure texture
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

                    // Apply color (use custom color if specified, otherwise use the color from store)
                    if (colors[child.name]) {
                        newMaterial.color.set(colors[child.name]);
                    } else {
                        // Fallback to original color if available
                        newMaterial.color.copy(originalMaterial.color);
                    }

                    // Apply texture
                    const textureConfig = textures[child.name];
                    if (textureConfig && loadedTextures.has(textureConfig.texture)) {
                        const texture = loadedTextures.get(textureConfig.texture)!.clone();

                        // Configure texture properties
                        texture.repeat.set(textureConfig.repeat, textureConfig.repeat);
                        texture.rotation = textureConfig.rotation * Math.PI / 180;
                        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                        texture.needsUpdate = true;

                        // Apply texture to material
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
    }, [colors, selectedPart, hovered, originalMaterials, textures, loadedTextures, roughness, metalness, scene]);

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

                // Store the selected part name (object name)
                setSelectedPart(e.object.name);

                // Store the exact click position in 3D space
                const clickPosition = {
                    x: e.point.x,
                    y: e.point.y,
                    z: e.point.z
                };

                // Save the click position for text placement
                setClickPosition(clickPosition);
            }}
        >
            <primitive object={scene} />

            {/* Render text elements properly positioned relative to the cake */}
            {Object.entries(texts).map(([textId, config]: [string, TextConfig]) => (
                <Text
                    key={textId}
                    position={[config.position.x, config.position.y, config.position.z]}
                    rotation={[config.rotation.x, config.rotation.y, config.rotation.z]}
                    fontSize={config.size}
                    color={config.color}
                    anchorX="center"
                    anchorY="middle"
                    renderOrder={10}
                >
                    {config.content}
                </Text>
            ))}
        </group>
    );
}