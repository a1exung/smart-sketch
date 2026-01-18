'use client';

import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  pulsePhase: number;
  shape: 'circle' | 'triangle' | 'square' | 'hexagon';
}

export default function LandingNeuralNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize nodes with teal/amber theme
    const nodeCount = 55;
    const shapes: Array<'circle' | 'triangle' | 'square' | 'hexagon'> = ['circle', 'triangle', 'square', 'hexagon'];

    nodesRef.current = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 3.5 + 2.5,
      opacity: Math.random() * 0.35 + 0.4,
      pulsePhase: Math.random() * Math.PI * 2,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }));

    const connectionDistance = 170;
    const nodeSpeed = 0.5;

    const animate = () => {
      // Clear with dark background trail
      ctx.fillStyle = 'rgba(12, 15, 20, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;

      // Update and draw nodes
      nodes.forEach((node, index) => {
        node.x += node.vx * nodeSpeed;
        node.y += node.vy * nodeSpeed;

        // Wrap around edges
        if (node.x < 0) node.x = canvas.width;
        if (node.x > canvas.width) node.x = 0;
        if (node.y < 0) node.y = canvas.height;
        if (node.y > canvas.height) node.y = 0;

        node.pulsePhase += 0.025;

        const pulse = Math.sin(node.pulsePhase) * 0.5 + 0.5;
        const currentRadius = node.radius + pulse * 2;
        const currentOpacity = node.opacity + pulse * 0.3;

        // Alternate colors - teal primary, amber accent (every 5th node)
        const isAccent = index % 5 === 0;

        // Draw node with gradient
        const gradient = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          currentRadius * 1.5
        );

        if (isAccent) {
          // Amber accent nodes
          gradient.addColorStop(0, `rgba(251, 191, 36, ${currentOpacity})`);
          gradient.addColorStop(0.5, `rgba(245, 158, 11, ${currentOpacity * 0.7})`);
          gradient.addColorStop(1, `rgba(217, 119, 6, ${currentOpacity * 0.2})`);
        } else {
          // Teal primary nodes
          gradient.addColorStop(0, `rgba(45, 212, 191, ${currentOpacity})`);
          gradient.addColorStop(0.5, `rgba(20, 184, 166, ${currentOpacity * 0.7})`);
          gradient.addColorStop(1, `rgba(13, 148, 136, ${currentOpacity * 0.2})`);
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();

        // Draw shapes
        switch (node.shape) {
          case 'circle':
            ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
            break;
          case 'triangle':
            const h = currentRadius * 1.5;
            ctx.moveTo(node.x, node.y - h);
            ctx.lineTo(node.x - h * 0.866, node.y + h * 0.5);
            ctx.lineTo(node.x + h * 0.866, node.y + h * 0.5);
            ctx.closePath();
            break;
          case 'square':
            const s = currentRadius * 1.3;
            ctx.rect(node.x - s, node.y - s, s * 2, s * 2);
            break;
          case 'hexagon':
            const size = currentRadius * 1.2;
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i;
              const hx = node.x + size * Math.cos(angle);
              const hy = node.y + size * Math.sin(angle);
              if (i === 0) ctx.moveTo(hx, hy);
              else ctx.lineTo(hx, hy);
            }
            ctx.closePath();
            break;
        }

        ctx.fill();

        // Draw subtle glow
        const glowColor = isAccent
          ? `rgba(251, 191, 36, ${currentOpacity * 0.4})`
          : `rgba(45, 212, 191, ${currentOpacity * 0.4})`;

        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius + 3, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.35;

            // Create gradient line
            const gradient = ctx.createLinearGradient(
              nodes[i].x,
              nodes[i].y,
              nodes[j].x,
              nodes[j].y
            );

            // Teal to teal-light gradient for connections
            gradient.addColorStop(0, `rgba(45, 212, 191, ${opacity})`);
            gradient.addColorStop(0.5, `rgba(20, 184, 166, ${opacity * 0.6})`);
            gradient.addColorStop(1, `rgba(13, 148, 136, ${opacity})`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ background: 'linear-gradient(145deg, #0c0f14 0%, #12161e 50%, #0c0f14 100%)' }}
    />
  );
}
