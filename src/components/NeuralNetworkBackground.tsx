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
}

export default function NeuralNetworkBackground() {
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

    // Initialize nodes
    const nodeCount = 45;
    nodesRef.current = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2.5 + 2,
      opacity: Math.random() * 0.35 + 0.25,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    const connectionDistance = 140;
    const nodeSpeed = 0.4;

    const animate = () => {
      // Clear with dark background trail
      ctx.fillStyle = 'rgba(12, 15, 20, 0.1)';
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

        node.pulsePhase += 0.02;

        const pulse = Math.sin(node.pulsePhase) * 0.5 + 0.5;
        const currentRadius = node.radius + pulse * 1.5;
        const currentOpacity = node.opacity + pulse * 0.25;

        // Alternate colors - mostly teal, some amber accents
        const isAccent = index % 6 === 0;

        // Draw node with gradient
        const gradient = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          currentRadius
        );

        if (isAccent) {
          // Amber accent
          gradient.addColorStop(0, `rgba(245, 158, 11, ${currentOpacity})`);
          gradient.addColorStop(1, `rgba(217, 119, 6, ${currentOpacity * 0.4})`);
        } else {
          // Teal primary
          gradient.addColorStop(0, `rgba(20, 184, 166, ${currentOpacity})`);
          gradient.addColorStop(1, `rgba(13, 148, 136, ${currentOpacity * 0.4})`);
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw subtle glow
        const glowColor = isAccent
          ? `rgba(245, 158, 11, ${currentOpacity * 0.25})`
          : `rgba(20, 184, 166, ${currentOpacity * 0.25})`;

        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius + 2, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.25;

            // Teal gradient for connections
            const gradient = ctx.createLinearGradient(
              nodes[i].x,
              nodes[i].y,
              nodes[j].x,
              nodes[j].y
            );
            gradient.addColorStop(0, `rgba(20, 184, 166, ${opacity})`);
            gradient.addColorStop(0.5, `rgba(13, 148, 136, ${opacity * 0.5})`);
            gradient.addColorStop(1, `rgba(20, 184, 166, ${opacity})`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
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
