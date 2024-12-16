import * as THREE from 'three';

export function createTextSprite(text: string) {
  const spriteMaterial = new THREE.SpriteMaterial({
    color: 0xffffff,
    sizeAttenuation: false,
  });
  
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(1, 0.25, 1);
  sprite.center.set(0, 0.5); // Anchor point at middle-left
  
  return sprite;
}