import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { expandBlueprint } from "./blueprintAdapter.ts";

const MESH_COLORS = {
  wall: 0xd8d4cc,
  siteFloor: 0x555555,
  door: 0x8b5a2b,
  window: 0x9ec5ff,
};

/** Build a canvas-texture sprite so room names float above the floor. */
function makeLabelSprite(text) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const fontSize = 48;
  canvas.width = 512;
  canvas.height = 128;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f8fafc";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(4, 1, 1);
  return sprite;
}

function shapeFromCorners(corners) {
  const shape = new THREE.Shape();
  corners.forEach(([x, z], i) => {
    if (i === 0) shape.moveTo(x, z);
    else shape.lineTo(x, z);
  });
  shape.closePath();
  return shape;
}

function buildObject(obj) {
  const group = new THREE.Group();

  switch (obj.type) {
    case "wallSegment": {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(obj.length, obj.height, obj.thickness),
        new THREE.MeshStandardMaterial({ color: MESH_COLORS.wall, roughness: 0.85 })
      );
      mesh.position.set(...obj.position);
      mesh.rotation.y = obj.rotationY;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      break;
    }

    case "door": {
      // Door panel set slightly off-center in the opening so it reads as a
      // hinged door rather than a block plugging the hole.
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(obj.width * 0.9, obj.height, obj.thickness * 0.4),
        new THREE.MeshStandardMaterial({ color: MESH_COLORS.door, roughness: 0.6 })
      );
      mesh.position.set(...obj.position);
      mesh.rotation.y = obj.rotationY;
      group.add(mesh);
      break;
    }

    case "window": {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(obj.width * 0.95, obj.height, obj.thickness * 0.3),
        new THREE.MeshStandardMaterial({
          color: MESH_COLORS.window,
          transparent: true,
          opacity: 0.5,
          roughness: 0.1,
          metalness: 0.1,
        })
      );
      mesh.position.set(...obj.position);
      mesh.rotation.y = obj.rotationY;
      group.add(mesh);
      break;
    }

    case "roomFloor": {
      const shapeGeo = new THREE.ShapeGeometry(shapeFromCorners(obj.corners));
      shapeGeo.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(
        shapeGeo,
        new THREE.MeshStandardMaterial({ color: obj.color, roughness: 0.9 })
      );
      mesh.position.y = 0.03; // sits just above the site slab, avoids z-fighting
      mesh.receiveShadow = true;
      group.add(mesh);

      if (obj.label) {
        const sprite = makeLabelSprite(obj.label);
        sprite.position.set(obj.labelPosition[0], 4.5, obj.labelPosition[1]);
        group.add(sprite);
      }
      break;
    }

    case "siteFloor": {
      const shapeGeo = new THREE.ShapeGeometry(shapeFromCorners(obj.corners));
      shapeGeo.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(
        shapeGeo,
        new THREE.MeshStandardMaterial({ color: MESH_COLORS.siteFloor, roughness: 1 })
      );
      mesh.receiveShadow = true;
      group.add(mesh);
      break;
    }

    default:
      break;
  }

  return group;
}

export default function ThreeDModelViewer({ blueprint, height = "100%" }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !blueprint) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.Fog(0x0f172a, 60, 140);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(35, 35, 45);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(15, 1, 15);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight.position.set(30, 50, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    scene.add(dirLight);

    const grid = new THREE.GridHelper(120, 60, 0x475569, 0x334155);
    scene.add(grid);

    const group = new THREE.Group();
    try {
      const objects = expandBlueprint(blueprint);
      objects.forEach((obj) => group.add(buildObject(obj)));
      setError(null);
    } catch (e) {
      setError(e.message);
    }
    scene.add(group);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [blueprint]);

  return (
    <div ref={containerRef} style={{ width: "100%", height }} className="relative">
      {error && (
        <div className="absolute top-3 left-3 text-xs text-red-400 bg-black/50 px-2 py-1 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
