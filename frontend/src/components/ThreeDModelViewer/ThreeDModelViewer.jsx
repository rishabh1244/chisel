import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const MESH_COLORS = {
  wall: 0xcdcdcd,
  floor: 0x8b8b8b,
  room: 0xabb8c3,
  door: 0xb4530a,
  window: 0x9ec5ff,
};

function buildObject(type, obj) {
  const geometry = new THREE.Group();

  if (type === "wall") {
    const start = new THREE.Vector3(obj.start?.[0] ?? 0, 0, obj.start?.[1] ?? 0);
    const end = new THREE.Vector3(obj.end?.[0] ?? 0, 0, obj.end?.[1] ?? 0);
    const height = obj.height ?? 3;
    const length = start.distanceTo(end);
    const thickness = obj.thickness ?? 0.2;
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(length, height, thickness),
      new THREE.MeshStandardMaterial({ color: MESH_COLORS.wall, roughness: 0.8 })
    );
    mesh.position.set(mid.x, height / 2, mid.z);
    mesh.lookAt(end.x, mid.y, end.z);
    geometry.add(mesh);
  }

  if (type === "floor" || type === "ground") {
    const corners = obj.corners || obj.points || [];
    if (corners.length >= 3) {
      const shape = new THREE.Shape();
      corners.forEach(([x, z], i) => {
        if (i === 0) shape.moveTo(x, z);
        else shape.lineTo(x, z);
      });
      shape.closePath();
      const shapeGeo = new THREE.ShapeGeometry(shape);
      shapeGeo.rotateX(-Math.PI / 2);
      const shapeMesh = new THREE.Mesh(
        shapeGeo,
        new THREE.MeshStandardMaterial({
          color: MESH_COLORS.floor,
          roughness: 0.9,
        })
      );
      shapeMesh.position.set(0, 0.05, 0);
      shapeMesh.receiveShadow = true;
      geometry.add(shapeMesh);
    } else {
      const width = obj.width ?? 10;
      const depth = obj.depth ?? width;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.15, depth),
        new THREE.MeshStandardMaterial({ color: MESH_COLORS.floor, roughness: 0.9 })
      );
      mesh.position.set(obj.position?.[0] ?? 0, 0.075, obj.position?.[1] ?? 0);
      geometry.add(mesh);
    }
  }

  if (type === "door") {
    const width = obj.width ?? 1;
    const height = obj.height ?? 2.4;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, 0.1),
      new THREE.MeshStandardMaterial({ color: MESH_COLORS.door, roughness: 0.6 })
    );
    mesh.position.set(obj.position?.[0] ?? 0, height / 2, obj.position?.[1] ?? 0);
    geometry.add(mesh);
  }

  if (type === "window") {
    const width = obj.width ?? 1.2;
    const height = obj.height ?? 1.2;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, 0.12),
      new THREE.MeshStandardMaterial({
        color: MESH_COLORS.window,
        transparent: true,
        opacity: 0.6,
        roughness: 0.2,
      })
    );
    mesh.position.set(obj.position?.[0] ?? 0, 1.5, obj.position?.[1] ?? 0);
    geometry.add(mesh);
  }

  if (type === "room") {
    const corners = obj.corners || obj.points || [];
    if (corners.length >= 3) {
      const shape = new THREE.Shape();
      corners.forEach(([x, z], i) => {
        if (i === 0) shape.moveTo(x, z);
        else shape.lineTo(x, z);
      });
      shape.closePath();

      const extrudeSettings = {
        depth: obj.height ?? 3,
        bevelEnabled: false,
      };
      const extrude = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const mesh = new THREE.Mesh(
        extrude,
        new THREE.MeshStandardMaterial({
          color: MESH_COLORS.room,
          transparent: true,
          opacity: 0.35,
          roughness: 0.7,
        })
      );
      geometry.add(mesh);
    }
  }

  return geometry;
}

export default function ThreeDModelViewer({ objects, height = "100%" }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(14, 12, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 1, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(15, 25, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const grid = new THREE.GridHelper(30, 30, 0x475569, 0x334155);
    scene.add(grid);

    const group = new THREE.Group();
    try {
      const list = Array.isArray(objects) ? objects : objects?.objects || [];
      list.forEach((obj) => {
        const type = String(obj.type || "").toLowerCase();
        const built = buildObject(type, obj);
        group.add(built);
      });
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
  }, [objects]);

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