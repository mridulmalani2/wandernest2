
'use client';

import { useEffect, useRef } from 'react';

interface WarpTransitionProps {
    isActive: boolean;
    onComplete?: () => void;
}

export function WarpTransition({ isActive, onComplete }: WarpTransitionProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>(0);
    const opacityRef = useRef(0);
    const speedRef = useRef(0);

    useEffect(() => {
        if (!isActive) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                canvas.width = entry.contentRect.width;
                canvas.height = entry.contentRect.height;
            }
        });
        resizeObserver.observe(canvas);

        // Star data
        const starCount = 1000;
        const stars: { x: number; y: number; z: number; o: number }[] = [];

        for (let i = 0; i < starCount; i++) {
            const x = (Math.random() - 0.5) * canvas.width * 2;
            const y = (Math.random() - 0.5) * canvas.height * 2;
            const z = Math.random() * 1000; // Depth
            stars.push({ x, y, z, o: Math.random() }); // o is varying size offset
        }

        let frame = 0;
        const startTime = Date.now();
        const duration = 2000; // 2 seconds total

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / duration);

            // Phase 1: Fade in (0-10%)
            // Phase 2: Accelerate (10-80%)
            // Phase 3: Fade to white/black flash (80-100%)

            if (progress < 0.1) {
                opacityRef.current = progress * 10; // 0 to 1
                speedRef.current = 2; // Initial drift
            } else if (progress < 0.8) {
                opacityRef.current = 1;
                // Exponential acceleration
                speedRef.current = 5 + Math.pow((progress - 0.1) * 20, 3);
            } else {
                // Flash phase
                opacityRef.current = 1;
                speedRef.current = 500; // Maximum warp
            }

            // Clear background
            ctx.fillStyle = `rgba(0, 0, 0, ${progress > 0.8 ? (progress - 0.8) * 5 : 0.1})`; // Fade to black at end
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            ctx.fillStyle = `rgba(255, 255, 255, ${opacityRef.current})`;

            for (let i = 0; i < starCount; i++) {
                const star = stars[i];

                // Move star towards camera (decrease z)
                star.z -= speedRef.current;

                // Reset star if it passes camera
                if (star.z <= 0) {
                    star.z = 1000;
                    star.x = (Math.random() - 0.5) * canvas.width * 2;
                    star.y = (Math.random() - 0.5) * canvas.height * 2;
                }

                // Project 3D position to 2D
                const scale = 500 / star.z;
                const sx = cx + star.x * scale;
                const sy = cy + star.y * scale;

                // Don't draw if off screen
                if (sx < 0 || sx > canvas.width || sy < 0 || sy > canvas.height) continue;

                const size = (1 - star.z / 1000) * 3 * scale;

                // Draw star (with trail if fast)
                if (speedRef.current > 20) {
                    ctx.strokeStyle = `rgba(200, 220, 255, ${Math.min(1, opacityRef.current)})`;
                    ctx.lineWidth = size;
                    ctx.beginPath();
                    ctx.moveTo(sx, sy);
                    // Trail goes away from center
                    const dx = sx - cx;
                    const dy = sy - cy;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    // Longer trail as we get faster
                    const trailLen = Math.min(len, speedRef.current * scale * 2);

                    ctx.lineTo(sx - (dx / len) * trailLen, sy - (dy / len) * trailLen);
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.arc(sx, sy, size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            if (progress < 1) {
                requestRef.current = requestAnimationFrame(animate);
            } else {
                if (onComplete) onComplete();
            }
            frame++;
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(requestRef.current);
            resizeObserver.disconnect();
        };
    }, [isActive, onComplete]);

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 z-[100] pointer-events-auto bg-black">
            <canvas
                ref={canvasRef}
                className="w-full h-full block"
                style={{ width: '100vw', height: '100vh' }}
            />
            {/* White flash overlay at the very end */}
            <div
                className="absolute inset-0 bg-white pointer-events-none animate-flash"
                style={{ animationDelay: '1.8s', animationDuration: '0.2s', opacity: 0 }}
            />
        </div>
    );
}
