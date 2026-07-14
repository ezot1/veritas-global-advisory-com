import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import globeTexture from "@/assets/globe.jpg";
import type { GlobeMarker } from "@/lib/globe-markers.functions";

const RADIUS = 1;

function latLngToVec3(lat: number, lng: number, r = RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(r * Math.sin(phi) * Math.cos(theta));
  const z = r * Math.sin(phi) * Math.sin(theta);
  const y = r * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export function Globe3D({ markers = [] }: { markers?: GlobeMarker[] }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const markerGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [hover, setHover] = useState<{ marker: GlobeMarker; x: number; y: number } | null>(null);

  // Setup scene once
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.z = 3.2;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const texture = new THREE.TextureLoader().load(globeTexture);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;

    const geometry = new THREE.SphereGeometry(RADIUS, 96, 96);
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      specular: new THREE.Color(0x1a3a6b),
      shininess: 12,
    });
    const globe = new THREE.Mesh(geometry, material);
    globe.rotation.z = 0.35;
    scene.add(globe);
    globeRef.current = globe;

    // Marker group is child of globe so markers rotate with it
    const markerGroup = new THREE.Group();
    globe.add(markerGroup);
    markerGroupRef.current = markerGroup;

    // Atmosphere
    const atmosGeo = new THREE.SphereGeometry(1.06, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      uniforms: { c: { value: 0.6 }, p: { value: 3.2 } },
      vertexShader: `varying vec3 vNormal; void main(){ vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `varying vec3 vNormal; uniform float c; uniform float p; void main(){ float i = pow(c - dot(vNormal, vec3(0.0,0.0,1.0)), p); gl_FragColor = vec4(0.83,0.69,0.22,1.0) * i; }`,
    });
    scene.add(new THREE.Mesh(atmosGeo, atmosMat));

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(5, 3, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xd4af37, 0.5);
    rim.position.set(-5, -2, -3);
    scene.add(rim);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hoveredId: string | null = null;

    const onPointerMove = (ev: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const onPointerLeave = () => {
      pointer.set(-2, -2);
      hoveredId = null;
      setHover(null);
    };
    const onClick = () => {
      if (!markerGroupRef.current) return;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(markerGroupRef.current.children, false);
      const first = hits[0];
      const href = first?.object.userData?.href as string | undefined;
      if (href) window.location.href = href;
    };
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    renderer.domElement.addEventListener("click", onClick);

    let raf = 0;
    const animate = () => {
      globe.rotation.y += 0.0018;

      if (markerGroupRef.current) {
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(markerGroupRef.current.children, false);
        const first = hits[0];
        const nextId = (first?.object.userData?.id as string | undefined) ?? null;
        renderer.domElement.style.cursor = nextId ? "pointer" : "default";
        if (nextId !== hoveredId) {
          hoveredId = nextId;
          if (first && nextId) {
            const marker = first.object.userData.marker as GlobeMarker;
            const world = new THREE.Vector3();
            first.object.getWorldPosition(world);
            const projected = world.project(camera);
            const rect = renderer.domElement.getBoundingClientRect();
            const x = ((projected.x + 1) / 2) * rect.width;
            const y = ((-projected.y + 1) / 2) * rect.height;
            setHover({ marker, x, y });
          } else {
            setHover(null);
          }
        }
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      atmosGeo.dispose();
      atmosMat.dispose();
      texture.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  // Sync markers into the marker group when data changes
  useEffect(() => {
    const group = markerGroupRef.current;
    if (!group) return;
    // Clear
    while (group.children.length) {
      const c = group.children[0] as THREE.Mesh;
      group.remove(c);
      (c.geometry as THREE.BufferGeometry)?.dispose?.();
      const mat = c.material as THREE.Material | THREE.Material[];
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose?.();
    }
    const dotGeo = new THREE.SphereGeometry(0.018, 16, 16);
    const ringGeo = new THREE.RingGeometry(0.024, 0.03, 32);
    for (const m of markers) {
      const pos = latLngToVec3(m.latitude, m.longitude, RADIUS * 1.005);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xd4af37 });
      const dot = new THREE.Mesh(dotGeo.clone(), dotMat);
      dot.position.copy(pos);
      dot.userData = { id: m.id, href: m.href, marker: m };
      group.add(dot);

      const ringMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo.clone(), ringMat);
      ring.position.copy(pos);
      ring.lookAt(0, 0, 0);
      group.add(ring);
    }
    return () => {
      dotGeo.dispose();
      ringGeo.dispose();
    };
  }, [markers]);

  return (
    <div ref={mountRef} className="absolute inset-0 w-full h-full" aria-label="Rotating 3D globe with office markers">
      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+12px)] whitespace-nowrap bg-[var(--navy-deep)] text-white px-3 py-2 text-xs uppercase tracking-[0.16em] shadow-lg"
          style={{ left: hover.x, top: hover.y }}
        >
          <div className="text-[var(--gold)] font-semibold">{hover.marker.label}</div>
          {hover.marker.description && <div className="mt-1 normal-case tracking-normal text-white/75 text-[11px]">{hover.marker.description}</div>}
        </div>
      )}
    </div>
  );
}
