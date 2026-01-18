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

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize nodes with more vibrant settings
    const nodeCount = 60; // More nodes for fuller effect
    const shapes: Array<'circle' | 'triangle' | 'square' | 'hexagon'> = ['circle', 'triangle', 'square', 'hexagon'];
    
    nodesRef.current = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 4 + 3, // Larger base size
      opacity: Math.random() * 0.4 + 0.5, // Higher opacity
      pulsePhase: Math.random() * Math.PI * 2,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }));

    const connectionDistance = 180; // Longer connections
    const nodeSpeed = 0.6;

    const animate = () => {
      // Clear canvas with darker trail for more contrast
      ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;

      // Update and draw nodes
      nodes.forEach((node) => {
        // Update position
        node.x += node.vx * nodeSpeed;
        node.y += node.vy * nodeSpeed;

        // Wrap around edges
        if (node.x < 0) node.x = canvas.width;
        if (node.x > canvas.width) node.x = 0;
        if (node.y < 0) node.y = canvas.height;
        if (node.y > canvas.height) node.y = 0;

        // Update pulse animation
        node.pulsePhase += 0.03;

        // Calculate pulse effect with stronger range
        const pulse = Math.sin(node.pulsePhase) * 0.5 + 0.5;
        const currentRadius = node.radius + pulse * 2.5; // Larger pulse
        const currentOpacity = node.opacity + pulse * 0.4;

        // Draw node with more vibrant gradient
        const gradient = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          currentRadius * 1.5
        );
        gradient.addColorStop(0, `rgba(96, 165, 250, ${currentOpacity})`); // Brighter blue center
        gradient.addColorStop(0.5, `rgba(139, 92, 246, ${currentOpacity * 0.8})`); // Vibrant purple
        gradient.addColorStop(1, `rgba(59, 130, 246, ${currentOpacity * 0.3})`); // Blue fade

        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        // Draw different shapes
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
            const s = currentRadius * 1.4;
            ctx.rect(node.x - s, node.y - s, s * 2, s * 2);
            break;
          case 'hexagon':
            const size = currentRadius * 1.3;
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

        // Draw stronger glow
        ctx.strokeStyle = `rgba(147, 197, 253, ${currentOpacity * 0.6})`; // Brighter glow
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // Glow matches shape
        if (node.shape === 'circle') {
          ctx.arc(node.x, node.y, currentRadius + 4, 0, Math.PI * 2);
        } else {
          // For non-circles, use a circular glow
          ctx.arc(node.x, node.y, currentRadius + 4, 0, Math.PI * 2);
        }
        ctx.stroke();

        // Draw outer glow ring
        ctx.strokeStyle = `rgba(96, 165, 250, ${currentOpacity * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius + 8, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Draw connections with more vibrant colors
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.5; // Stronger opacity
            
            // Create vibrant gradient line
            const gradient = ctx.createLinearGradient(
              nodes[i].x,
              nodes[i].y,
              nodes[j].x,
              nodes[j].y
            );
            gradient.addColorStop(0, `rgba(96, 165, 250, ${opacity})`); // Bright blue
            gradient.addColorStop(0.5, `rgba(167, 139, 250, ${opacity * 0.8})`); // Vibrant purple
            gradient.addColorStop(1, `rgba(139, 92, 246, ${opacity})`); // Purple

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5; // Thicker lines
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
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
    />
  );
}
