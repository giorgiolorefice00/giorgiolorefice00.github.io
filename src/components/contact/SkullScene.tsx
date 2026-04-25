import { useEffect, useRef } from "react";
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group,
  IcosahedronGeometry, BoxGeometry, TorusGeometry,
  MeshBasicMaterial, Mesh, Color,
  BufferGeometry, BufferAttribute, PointsMaterial, Points,
} from "three";

export default function SkullScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new Scene();
    const camera = new PerspectiveCamera(45, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
    camera.position.set(0, 0, 5);

    const resize = () => {
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight, false);
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
      camera.updateProjectionMatrix();
    };
    resize();

    const red = new Color(0xC8102E);

    const group = new Group();
    scene.add(group);

    // Cranium
    const craniumGeo = new IcosahedronGeometry(1.4, 2);
    craniumGeo.scale(1, 1.1, 0.9);
    const cranium = new Mesh(craniumGeo, new MeshBasicMaterial({ color: red, wireframe: true, opacity: 0.85, transparent: true }));
    cranium.position.y = 0.1;
    group.add(cranium);

    // Jaw
    const jawGeo = new IcosahedronGeometry(0.9, 1);
    jawGeo.scale(0.85, 0.5, 0.8);
    const jaw = new Mesh(jawGeo, new MeshBasicMaterial({ color: red, wireframe: true, opacity: 0.55, transparent: true }));
    jaw.position.set(0, -1.0, 0.1);
    group.add(jaw);

    // Eye sockets
    const eyeGeo = new TorusGeometry(0.28, 0.04, 6, 12);
    const eyeMat = new MeshBasicMaterial({ color: red, wireframe: true, opacity: 0.9, transparent: true });
    const leftEye = new Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.45, 0.2, 1.0);
    leftEye.rotation.x = 0.3;
    group.add(leftEye);
    const rightEye = new Mesh(eyeGeo.clone(), eyeMat.clone());
    rightEye.position.set(0.45, 0.2, 1.0);
    rightEye.rotation.x = 0.3;
    group.add(rightEye);

    // Teeth
    const teeth = new Mesh(
      new BoxGeometry(1.4, 0.08, 0.06),
      new MeshBasicMaterial({ color: red, wireframe: true, opacity: 0.5, transparent: true })
    );
    teeth.position.set(0, -0.75, 0.7);
    group.add(teeth);

    // Particles
    const count = 80;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    const particleGeo = new BufferGeometry();
    particleGeo.setAttribute("position", new BufferAttribute(positions, 3));
    const particles = new Points(particleGeo, new PointsMaterial({ color: red, size: 0.018, transparent: true, opacity: 0.4 }));
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
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      t += 0.003;
      group.rotation.y = t * 0.4 + mouseRef.current.x * 0.25;
      group.rotation.x = Math.sin(t * 0.3) * 0.08 + mouseRef.current.y * 0.12;
      jaw.position.y = -1.0 + Math.sin(t * 1.2) * 0.02;
      particles.rotation.y = t * 0.05;
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", resize);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", opacity: 0.6 }}
    />
  );
}
