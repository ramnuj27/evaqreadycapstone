import type { ComponentProps } from 'react';
import { useEffect, useEffectEvent, useRef } from 'react';
import { cn } from '@/lib/utils';

type GeneratedDisasterVideoProps = ComponentProps<'video'>;

export default function GeneratedDisasterVideo({
    className,
    ...props
}: GeneratedDisasterVideoProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const drawFrame = useEffectEvent((time: number) => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if (!canvas || !context) {
            return;
        }

        const width = canvas.width;
        const height = canvas.height;
        const shift = time / 1000;

        context.clearRect(0, 0, width, height);

        const sky = context.createLinearGradient(0, 0, width, height);
        sky.addColorStop(0, '#0c2340');
        sky.addColorStop(0.48, '#071828');
        sky.addColorStop(1, '#03111f');
        context.fillStyle = sky;
        context.fillRect(0, 0, width, height);

        const glow = context.createRadialGradient(
            width * 0.82,
            height * 0.22,
            24,
            width * 0.82,
            height * 0.22,
            width * 0.34,
        );
        glow.addColorStop(0, 'rgba(255, 164, 84, 0.72)');
        glow.addColorStop(1, 'rgba(255, 164, 84, 0)');
        context.fillStyle = glow;
        context.fillRect(0, 0, width, height);

        const coolGlow = context.createRadialGradient(
            width * 0.22,
            height * 0.3,
            20,
            width * 0.22,
            height * 0.3,
            width * 0.28,
        );
        coolGlow.addColorStop(0, 'rgba(93, 194, 255, 0.34)');
        coolGlow.addColorStop(1, 'rgba(93, 194, 255, 0)');
        context.fillStyle = coolGlow;
        context.fillRect(0, 0, width, height);

        context.strokeStyle = 'rgba(188, 224, 255, 0.18)';
        context.lineWidth = 5;

        for (let index = -2; index < 16; index += 1) {
            const x = index * 145 + ((shift * 48) % 145);
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x - 88, height);
            context.stroke();
        }

        context.fillStyle = '#0c2741';
        context.beginPath();
        context.moveTo(0, height * 0.58);
        context.bezierCurveTo(
            width * 0.18,
            height * 0.52,
            width * 0.28,
            height * 0.46,
            width * 0.42,
            height * 0.52,
        );
        context.bezierCurveTo(
            width * 0.57,
            height * 0.58,
            width * 0.66,
            height * 0.62,
            width * 0.82,
            height * 0.55,
        );
        context.bezierCurveTo(
            width * 0.9,
            height * 0.52,
            width * 0.96,
            height * 0.5,
            width,
            height * 0.54,
        );
        context.lineTo(width, height);
        context.lineTo(0, height);
        context.closePath();
        context.fill();

        context.fillStyle = '#143655';

        for (let index = 0; index < 9; index += 1) {
            const baseX = index * 170;
            const buildingHeight = 130 + (index % 3) * 42;
            const animatedOffset = Math.sin(shift + index) * 8;

            context.fillRect(
                baseX,
                height * 0.52 - animatedOffset,
                110,
                buildingHeight,
            );
            context.fillRect(
                baseX + 76,
                height * 0.48 + animatedOffset,
                52,
                buildingHeight + 34,
            );
        }

        context.fillStyle = '#0b2b44';
        context.beginPath();
        context.moveTo(0, height * 0.71);
        context.bezierCurveTo(
            width * 0.18,
            height * 0.66,
            width * 0.32,
            height * 0.68,
            width * 0.48,
            height * 0.74,
        );
        context.bezierCurveTo(
            width * 0.66,
            height * 0.8,
            width * 0.84,
            height * 0.72,
            width,
            height * 0.76,
        );
        context.lineTo(width, height);
        context.lineTo(0, height);
        context.closePath();
        context.fill();

        context.strokeStyle = '#ff9e54';
        context.lineWidth = 16;
        context.lineCap = 'round';
        context.beginPath();
        context.moveTo(width * 0.16, height * 0.79);
        context.bezierCurveTo(
            width * 0.28,
            height * 0.84,
            width * 0.41,
            height * 0.71,
            width * 0.56,
            height * 0.7,
        );
        context.bezierCurveTo(
            width * 0.68,
            height * 0.69,
            width * 0.81,
            height * 0.76,
            width * 0.9,
            height * 0.75,
        );
        context.stroke();

        const pulsePoints = [
            [width * 0.24, height * 0.77],
            [width * 0.52, height * 0.7],
            [width * 0.82, height * 0.75],
        ] as const;

        pulsePoints.forEach(([x, y], index) => {
            const radius = 18 + (Math.sin(shift * 1.6 + index) + 1) * 8;
            context.fillStyle = '#ffd18a';
            context.beginPath();
            context.arc(x, y, 20, 0, Math.PI * 2);
            context.fill();

            context.strokeStyle = `rgba(255, 209, 138, ${0.35 - index * 0.08})`;
            context.lineWidth = 3;
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.stroke();
        });
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        if (!canvas || !video) {
            return;
        }

        canvas.width = 1600;
        canvas.height = 900;

        const stream = canvas.captureStream(24);
        video.srcObject = stream;
        void video.play().catch(() => {});

        let frameId = 0;

        const animate = (time: number) => {
            drawFrame(time);
            frameId = window.requestAnimationFrame(animate);
        };

        frameId = window.requestAnimationFrame(animate);

        return () => {
            window.cancelAnimationFrame(frameId);
            stream.getTracks().forEach((track) => track.stop());

            if (video.srcObject === stream) {
                video.srcObject = null;
            }
        };
    }, []);

    return (
        <>
            <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className={cn('object-cover', className)}
                {...props}
            />
            <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
        </>
    );
}
