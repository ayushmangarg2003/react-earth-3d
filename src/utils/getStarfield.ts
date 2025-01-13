import * as THREE from 'three';

interface StarfieldOptions {
    numStars?: number;
    minRadius?: number;
    maxRadius?: number;
    starSize?: number;
    starColor?: {
        hue?: number;
        saturation?: number;
    };
    starTexturePath?: string;
}

interface SpherePoint {
    pos: THREE.Vector3;
    hue: number;
    minDist: number;
}

const defaultOptions: StarfieldOptions = {
    numStars: 500,
    minRadius: 25,
    maxRadius: 50,
    starSize: 0.2,
    starColor: {
        hue: 0.6,
        saturation: 0.2,
    },
    starTexturePath: '/textures/stars/circle.png',
};

export function getStarfield(options: StarfieldOptions = {}): THREE.Points {
    const {
        numStars,
        minRadius,
        maxRadius,
        starSize,
        starColor,
        starTexturePath,
    } = { ...defaultOptions, ...options };

    function randomSpherePoint(): SpherePoint {
        const radius = Math.random() * (maxRadius! - minRadius!) + minRadius!;
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        return {
            pos: new THREE.Vector3(x, y, z),
            hue: starColor!.hue!,
            minDist: radius,
        };
    }

    const vertices: number[] = [];
    const colors: number[] = [];
    const positions: SpherePoint[] = [];

    for (let i = 0; i < numStars!; i += 1) {
        const point = randomSpherePoint();
        const { pos, hue } = point;
        positions.push(point);

        const color = new THREE.Color().setHSL(
            hue,
            starColor!.saturation!,
            Math.random()
        );

        vertices.push(pos.x, pos.y, pos.z);
        colors.push(color.r, color.g, color.b);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(vertices, 3)
    );
    geometry.setAttribute(
        'color',
        new THREE.Float32BufferAttribute(colors, 3)
    );

    const material = new THREE.PointsMaterial({
        size: starSize,
        vertexColors: true,
        map: new THREE.TextureLoader().load(starTexturePath!),
    });

    return new THREE.Points(geometry, material);
}
