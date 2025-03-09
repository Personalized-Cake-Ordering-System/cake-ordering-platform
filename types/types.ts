import * as THREE from "three";

export interface TextureConfig {
  texture: string;
  scale: number;
  rotation: number;
  repeat: number;
}

export interface TextConfig {
  content: string;
  font: string;
  size: number;
  color: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
}

export interface ToppingConfig {
  type: string;
  density: number;
  size: number;
  color: string;
  position: THREE.Vector3;
}

export interface ImageConfig {
  url: string;
  scale: number;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  opacity: number;
}
