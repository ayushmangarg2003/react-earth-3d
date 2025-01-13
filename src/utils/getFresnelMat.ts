import * as THREE from 'three';

interface FresnelMatOptions {
    rimHex?: number;
    facingHex?: number;
    fresnelBias?: number;
    fresnelScale?: number;
    fresnelPower?: number;
}

const defaultOptions: FresnelMatOptions = {
    rimHex: 0x0088ff,
    facingHex: 0x000000,
    fresnelBias: 0.1,
    fresnelScale: 1.0,
    fresnelPower: 4.0,
};

export function getFresnelMat(options: FresnelMatOptions = {}): THREE.ShaderMaterial {
    const { rimHex, facingHex, fresnelBias, fresnelScale, fresnelPower } = {
        ...defaultOptions,
        ...options,
    };

    const uniforms = {
        color1: { value: new THREE.Color(rimHex) },
        color2: { value: new THREE.Color(facingHex) },
        fresnelBias: { value: fresnelBias },
        fresnelScale: { value: fresnelScale },
        fresnelPower: { value: fresnelPower },
    };

    const vertexShader = `
    uniform float fresnelBias;
    uniform float fresnelScale;
    uniform float fresnelPower;
    
    varying float vReflectionFactor;
    
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    
      vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);
    
      vec3 I = worldPosition.xyz - cameraPosition;
    
      vReflectionFactor = fresnelBias + fresnelScale * pow(1.0 + dot(normalize(I), worldNormal), fresnelPower);
    
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

    const fragmentShader = `
    uniform vec3 color1;
    uniform vec3 color2;
    
    varying float vReflectionFactor;
    
    void main() {
      float f = clamp(vReflectionFactor, 0.0, 1.0);
      gl_FragColor = vec4(mix(color2, color1, vec3(f)), f);
    }
  `;

    return new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
    });
}
