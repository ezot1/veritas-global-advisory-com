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

type MarkerRefs = {
  marker: GlobeMarker;
  dot: THREE.Mesh;
  ring: THREE.Mesh;
  dotMat: THREE.MeshBasicMaterial;
  ringMat: THREE.MeshBasicMaterial;
  localPos: THREE.Vector3;
};

export function Globe3D({ markers = [] }: { markers?: GlobeMarker[] }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const markerGroupRef = useRef<THREE.Group | null>(null);
  const markerRefsRef = useRef<MarkerRefs[]>([]);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const visibleRef = useRef(true);
  const [hover, setHover] = useState<{ marker: GlobeMarker; x: number; y: number } | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.3);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const loader = new THREE.TextureLoader();
    const texture = loader.load(globeTexture);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const geometry = new THREE.SphereGeometry(RADIUS, 128, 128);
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      specular: new THREE.Color(0x18325a),
      shininess: 22,
    });
    const globe = new THREE.Mesh(geometry, material);
    // Upright with real Earth axial tilt (~23.4°)
    globe.rotation.z = THREE.MathUtils.degToRad(23.4);
    scene.add(globe);
    globeRef.current = globe;

    const markerGroup = new THREE.Group();
    globe.add(markerGroup);
    markerGroupRef.current = markerGroup;

    // Inner soft rim (sits just above surface, in shadow of atmos)
    const innerGlowGeo = new THREE.SphereGeometry(1.008, 64, 64);
    const innerGlowMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {},
      vertexShader: `varying vec3 vNormal; varying vec3 vView; void main(){ vNormal = normalize(normalMatrix * normal); vView = normalize(-(modelViewMatrix * vec4(position,1.0)).xyz); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `varying vec3 vNormal; varying vec3 vView; void main(){ float rim = 1.0 - max(dot(vNormal, vView), 0.0); rim = pow(rim, 3.0); gl_FragColor = vec4(0.45, 0.7, 1.0, 1.0) * rim * 0.55; }`,
    });
    scene.add(new THREE.Mesh(innerGlowGeo, innerGlowMat));

    // Outer atmosphere haze
    const atmosGeo = new THREE.SphereGeometry(1.09, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {},
      vertexShader: `varying vec3 vNormal; void main(){ vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `varying vec3 vNormal; void main(){ float i = pow(0.55 - dot(vNormal, vec3(0.0,0.0,1.0)), 3.5); gl_FragColor = vec4(0.3, 0.55, 1.0, 1.0) * i; }`,
    });
    scene.add(new THREE.Mesh(atmosGeo, atmosMat));

    scene.add(new THREE.AmbientLight(0x1a2540, 0.4));
    const sun = new THREE.DirectionalLight(0xfff2d8, 1.6);
    sun.position.set(5, 2, 4);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x3a5a90, 0.35);
    fill.position.set(-4, -1, -3);
    scene.add(fill);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-2, -2);
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
      const hits = raycaster.intersectObjects(
        markerGroupRef.current.children.filter((c) => (c as THREE.Mesh).userData?.clickable),
        false,
      );
      const first = hits[0];
      const href = first?.object.userData?.href as string | undefined;
      if (href) window.location.href = href;
    };
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    renderer.domElement.addEventListener("click", onClick);

    // Pause rendering when off-screen or tab hidden
    const io = new IntersectionObserver((entries) => {
      visibleRef.current = entries[0]?.isIntersecting ?? true;
    });
    io.observe(mount);
    const onVis = () => { visibleRef.current = !document.hidden; };
    document.addEventListener("visibilitychange", onVis);

    const worldPos = new THREE.Vector3();
    let raf = 0;
    let last = performance.now();
    const ANGULAR_VELOCITY = 0.08; // rad/s — smooth, satellite-like drift

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const now = performance.now();
      // Clamp large gaps (tab switch) so rotation doesn't jump
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!visibleRef.current) return;

      globe.rotation.y += ANGULAR_VELOCITY * dt;

      // Fade markers on the back of the globe
      camera.getWorldDirection(camDir);
      for (const ref of markerRefsRef.current) {
        ref.dot.getWorldPosition(worldPos);
        const toCam = worldPos.clone().sub(camera.position).normalize();
        const facing = -toCam.dot(worldPos.clone().normalize());
        const vis = Math.max(0, Math.min(1, (facing + 0.05) * 3));
        ref.dotMat.opacity = vis;
        ref.ringMat.opacity = vis * 0.7;
        ref.dotMat.transparent = true;
      }

      if (markerGroupRef.current) {
        raycaster.setFromCamera(pointer, camera);
        const clickables = markerGroupRef.current.children.filter(
          (c) => (c as THREE.Mesh).userData?.clickable && ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity > 0.4,
        );
        const hits = raycaster.intersectObjects(clickables, false);
        const first = hits[0];
        const nextId = (first?.object.userData?.id as string | undefined) ?? null;
        renderer.domElement.style.cursor = nextId ? "pointer" : "default";
        if (nextId !== hoveredId) {
          hoveredId = nextId;
          if (first && nextId) {
            const marker = first.object.userData.marker as GlobeMarker;
            first.object.getWorldPosition(worldPos);
            const projected = worldPos.clone().project(camera);
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
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      atmosGeo.dispose();
      atmosMat.dispose();
      innerGlowGeo.dispose();
      innerGlowMat.dispose();
      texture.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  // Sync markers when data changes
  useEffect(() => {
    const group = markerGroupRef.current;
    if (!group) return;
    while (group.children.length) {
      const c = group.children[0] as THREE.Mesh;
      group.remove(c);
      (c.geometry as THREE.BufferGeometry)?.dispose?.();
      const mat = c.material as THREE.Material | THREE.Material[];
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose?.();
    }
    markerRefsRef.current = [];

    const dotGeo = new THREE.SphereGeometry(0.016, 16, 16);
    const ringGeo = new THREE.RingGeometry(0.022, 0.028, 32);
    for (const m of markers) {
      const pos = latLngToVec3(m.latitude, m.longitude, RADIUS * 1.008);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true });
      const dot = new THREE.Mesh(dotGeo.clone(), dotMat);
      dot.position.copy(pos);
      dot.userData = { id: m.id, href: m.href, marker: m, clickable: true };
      group.add(dot);

      const ringMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo.clone(), ringMat);
      ring.position.copy(pos);
      ring.lookAt(0, 0, 0);
      group.add(ring);

      markerRefsRef.current.push({ marker: m, dot, ring, dotMat, ringMat, localPos: pos.clone() });
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
