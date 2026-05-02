import { useEffect, useRef } from "react";

// Three.js is dynamically imported inside the effect so mobile visitors
// (window.innerWidth < 768) never download the 490KB bundle.
export default function SkullScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: 0, y: 0 });
  const rafRef    = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const mobile = window.innerWidth < 768;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let disposeRenderer: (() => void) | undefined;
    let cleanupListeners: (() => void) | undefined;

    import("three").then(({
      WebGLRenderer, Scene, PerspectiveCamera, Group,
      IcosahedronGeometry, BoxGeometry, TorusGeometry,
      MeshBasicMaterial, Mesh, Color,
      BufferGeometry, BufferAttribute, PointsMaterial, Points,
    }) => {
      if (cancelled || !canvas) return;

      const renderer = new WebGLRenderer({ canvas, antialias: !mobile, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.0 : 1.5));
      renderer.setClearColor(0x0A0A0A, 1);
      disposeRenderer = () => renderer.dispose();

      const scene  = new Scene();
      const camera = new PerspectiveCamera(45, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
      camera.position.set(0, 0, 5);

      const resize = () => {
        renderer.setSize(canvas.offsetWidth, canvas.offsetHeight, false);
        camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
        camera.updateProjectionMatrix();
      };
      resize();

      const hot  = new Color(0xFF1F1F); // blood-hot: bright wireframe
      const glow = new Color(0xC8102E); // blood: softer outer halo
      const group = new Group();
      scene.add(group);

      // Cranium
      const craniumGeo = new IcosahedronGeometry(1.4, mobile ? 1 : 2);
      craniumGeo.scale(1, 1.1, 0.9);
      const cranium = new Mesh(craniumGeo, new MeshBasicMaterial({ color: hot, wireframe: true, opacity: 1.0, transparent: false }));
      cranium.position.y = 0.1;
      group.add(cranium);

      // Cranium glow halo — slightly larger, softer
      const glowGeo = craniumGeo.clone();
      glowGeo.scale(1.05, 1.05, 1.05);
      const glowMesh = new Mesh(glowGeo, new MeshBasicMaterial({ color: glow, wireframe: true, opacity: 0.35, transparent: true }));
      glowMesh.position.y = 0.1;
      group.add(glowMesh);

      // Jaw
      const jawGeo = new IcosahedronGeometry(0.9, 1);
      jawGeo.scale(0.85, 0.5, 0.8);
      const jaw = new Mesh(jawGeo, new MeshBasicMaterial({ color: hot, wireframe: true, opacity: 0.9, transparent: true }));
      jaw.position.set(0, -1.0, 0.1);
      group.add(jaw);

      // Eye sockets
      const eyeGeo  = new TorusGeometry(0.28, 0.04, 6, 12);
      const eyeMat  = new MeshBasicMaterial({ color: hot, wireframe: true, opacity: 1.0, transparent: false });
      const leftEye = new Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.45, 0.2, 1.0);
      leftEye.rotation.x = 0.3;
      group.add(leftEye);
      const rightEye = new Mesh(eyeGeo.clone(), eyeMat.clone());
      rightEye.position.set(0.45, 0.2, 1.0);
      rightEye.rotation.x = 0.3;
      group.add(rightEye);

      // Teeth
      group.add(new Mesh(
        new BoxGeometry(1.4, 0.08, 0.06),
        new MeshBasicMaterial({ color: hot, wireframe: true, opacity: 0.85, transparent: true }),
      )).position.set(0, -0.75, 0.7);

      // Particles
      const positions = new Float32Array(80 * 3);
      for (let i = 0; i < 80; i++) {
        positions[i*3]   = (Math.random()-0.5)*8;
        positions[i*3+1] = (Math.random()-0.5)*8;
        positions[i*3+2] = (Math.random()-0.5)*4;
      }
      const particleGeo = new BufferGeometry();
      particleGeo.setAttribute("position", new BufferAttribute(positions, 3));
      const particles = new Points(particleGeo, new PointsMaterial({ color: hot, size: 0.025, transparent: true, opacity: 0.65 }));
      scene.add(particles);

      const onMouse = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = {
          x: ((e.clientX - rect.left) / rect.width  - 0.5) * 2,
          y: ((e.clientY - rect.top)  / rect.height - 0.5) * -2,
        };
      };
      window.addEventListener("mousemove", onMouse);
      window.addEventListener("resize", resize);

      let t = 0;
      let running = true;
      const rotSpeed = mobile ? 0.0015 : 0.003;

      const loop = () => {
        if (!running) return;
        rafRef.current = requestAnimationFrame(loop);
        t += rotSpeed;
        group.rotation.y = t * 0.4 + mouseRef.current.x * 0.25;
        group.rotation.x = Math.sin(t * 0.3) * 0.08 + mouseRef.current.y * 0.12;
        jaw.position.y   = -1.0 + Math.sin(t * 1.2) * 0.02;
        particles.rotation.y = t * 0.05;
        renderer.render(scene, camera);
      };
      loop();

      const onVis = () => {
        running = !document.hidden;
        if (running) loop();
      };
      document.addEventListener("visibilitychange", onVis);

      const io = new IntersectionObserver(([e]) => {
        running = e!.isIntersecting;
        if (running) loop();
        else cancelAnimationFrame(rafRef.current);
      }, { threshold: 0 });
      io.observe(canvas);

      cleanupListeners = () => {
        cancelAnimationFrame(rafRef.current);
        window.removeEventListener("mousemove", onMouse);
        window.removeEventListener("resize", resize);
        document.removeEventListener("visibilitychange", onVis);
        io.disconnect();
      };

      // If component unmounted before import resolved, clean up immediately
      if (cancelled) { cleanupListeners(); disposeRenderer?.(); }
    });

    return () => {
      cancelled = true;
      cleanupListeners?.();
      disposeRenderer?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
    />
  );
}
