import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EarthVisualizationProps } from './types';
import { getStarfield } from './utils/getStarfield';
import { getFresnelMat } from './utils/getFresnelMat';

const defaultProps: Required<EarthVisualizationProps> = {
    width: '100%',
    height: '100%',
    rotationSpeed: 0.002,
    numStars: 2000,
    earthTexturePath: '/textures/00_earthmap1k.jpg',
    specularMapPath: '/textures/02_earthspec1k.jpg',
    bumpMapPath: '/textures/01_earthbump1k.jpg',
    cloudsTexturePath: '/textures/04_earthcloudmap.jpg',
    cloudsAlphaMapPath: '/textures/05_earthcloudmaptrans.jpg',
    lightsTexturePath: '/textures/03_earthlights1k.jpg',
};

export const EarthVisualization: React.FC<EarthVisualizationProps> = (props) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const props_ = { ...defaultProps, ...props };
    const {
        width,
        height,
        rotationSpeed,
        numStars,
        earthTexturePath,
        specularMapPath,
        bumpMapPath,
        cloudsTexturePath,
        cloudsAlphaMapPath,
        lightsTexturePath,
    } = props_;

    useEffect(() => {
        if (!mountRef.current) return;

        const initialWidth = typeof width === 'number'
            ? width
            : mountRef.current.clientWidth || window.innerWidth;
        const initialHeight = typeof height === 'number'
            ? height
            : mountRef.current.clientHeight || window.innerHeight;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, initialWidth / initialHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(initialWidth, initialHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;

        // Handle different Three.js versions
        if ('outputEncoding' in renderer) {
            (renderer as any).outputEncoding = THREE.sRGBEncoding;
        } else if ('outputColorSpace' in renderer) {
            (renderer as any).outputColorSpace = THREE.SRGBColorSpace;
        }

        mountRef.current.appendChild(renderer.domElement);

        const earthGroup = new THREE.Group();
        earthGroup.rotation.z = (-23.4 * Math.PI) / 180;
        scene.add(earthGroup);

        new OrbitControls(camera, renderer.domElement);

        const detail = 12;
        const loader = new THREE.TextureLoader();

        const geometry = new THREE.IcosahedronGeometry(1, detail);
        const material = new THREE.MeshPhongMaterial({
            map: loader.load(earthTexturePath),
            specularMap: loader.load(specularMapPath),
            bumpMap: loader.load(bumpMapPath),
            bumpScale: 0.04,
        });

        const earthMesh = new THREE.Mesh(geometry, material);
        earthGroup.add(earthMesh);

        const lightsMat = new THREE.MeshBasicMaterial({
            map: loader.load(lightsTexturePath),
            blending: THREE.AdditiveBlending,
        });
        const lightsMesh = new THREE.Mesh(geometry, lightsMat);
        earthGroup.add(lightsMesh);

        const cloudsMat = new THREE.MeshStandardMaterial({
            map: loader.load(cloudsTexturePath),
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            alphaMap: loader.load(cloudsAlphaMapPath),
        });
        const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
        cloudsMesh.scale.setScalar(1.003);
        earthGroup.add(cloudsMesh);

        const fresnelMat = getFresnelMat();
        const glowMesh = new THREE.Mesh(geometry, fresnelMat);
        glowMesh.scale.setScalar(1.01);
        earthGroup.add(glowMesh);

        const stars = getStarfield({ numStars });
        scene.add(stars);

        const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
        sunLight.position.set(-2, 0.5, 1.5);
        scene.add(sunLight);

        let animationFrameId: number;

        function animate() {
            animationFrameId = requestAnimationFrame(animate);

            earthMesh.rotation.y += rotationSpeed;
            lightsMesh.rotation.y += rotationSpeed;
            cloudsMesh.rotation.y += rotationSpeed * 1.15;
            glowMesh.rotation.y += rotationSpeed;
            stars.rotation.y -= rotationSpeed * 0.1;

            renderer.render(scene, camera);
        }

        animate();

        function handleResize() {
            if (!mountRef.current) return;

            const newWidth = typeof width === 'number'
                ? width
                : mountRef.current.clientWidth || window.innerWidth;
            const newHeight = typeof height === 'number'
                ? height
                : mountRef.current.clientHeight || window.innerHeight;

            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        }

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);

            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }

            // Clean up Three.js resources
            geometry.dispose();
            material.dispose();
            lightsMat.dispose();
            cloudsMat.dispose();
            fresnelMat.dispose();
            renderer.dispose();
        };
    }, [
        width,
        height,
        rotationSpeed,
        numStars,
        earthTexturePath,
        specularMapPath,
        bumpMapPath,
        cloudsTexturePath,
        cloudsAlphaMapPath,
        lightsTexturePath,
    ]);

    const containerStyle: React.CSSProperties = {
        width: width,
        height: height,
        position: 'relative',
    };

    return <div ref={mountRef} style={containerStyle} />;
};