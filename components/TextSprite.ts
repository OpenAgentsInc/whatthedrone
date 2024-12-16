import * as THREE from 'three';

export function createTextSprite(text: string) {
  // Create a sprite material with a simple circle texture
  const spriteMaterial = new THREE.SpriteMaterial({
    color: 0xffffff,
    sizeAttenuation: false,
  });
  
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(0.5, 0.5, 1);
  sprite.position.y = 0.5; // Position above the sphere
  
  return sprite;
}