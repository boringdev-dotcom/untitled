import { useEffect, useRef } from "react";
import type { AudioStreamPlayer } from "../utils/audioPlayer";

interface Props {
  player: AudioStreamPlayer | null;
  color: string;
  isActive: boolean;
}

export function AudioVisualizer({ player, color, isActive }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    function draw() {
      rafRef.current = requestAnimationFrame(draw);
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      if (!isActive) {
        drawIdleBars(ctx, width, height, color);
        return;
      }

      if (!player) {
        drawFakeActiveBars(ctx, width, height, color);
        return;
      }

      const data = player.getFrequencyData();
      drawBars(ctx, data, width, height, color);
    }

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [player, color, isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-20 rounded-xl"
      style={{ opacity: isActive ? 1 : 0.3 }}
    />
  );
}

function drawBars(
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  width: number,
  height: number,
  color: string
) {
  const barCount = 40;
  const gap = 3;
  const barWidth = (width - gap * (barCount - 1)) / barCount;
  const step = Math.max(1, Math.floor(data.length / barCount));
  const centerY = height / 2;

  for (let i = 0; i < barCount; i++) {
    const value = data[i * step] ?? 0;
    const normalized = value / 255;
    const barHeight = Math.max(4, normalized * height * 0.8);
    const x = i * (barWidth + gap);
    const y = centerY - barHeight / 2;

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.4 + normalized * 0.6;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawFakeActiveBars(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string
) {
  const barCount = 40;
  const gap = 3;
  const barWidth = (width - gap * (barCount - 1)) / barCount;
  const centerY = height / 2;

  const t = Date.now() / 1000;
  for (let i = 0; i < barCount; i++) {
    const w1 = Math.sin(t * 4 + i * 0.4);
    const w2 = Math.sin(t * 7 + i * 0.9);
    const w3 = Math.sin(t * 2.3 + i * 0.2);
    const amp = (w1 * 0.4 + w2 * 0.3 + w3 * 0.3 + 1) / 2;
    const normalized = 0.2 + amp * 0.7;
    const barHeight = Math.max(4, normalized * height * 0.78);
    const x = i * (barWidth + gap);
    const y = centerY - barHeight / 2;

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.35 + normalized * 0.55;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawIdleBars(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string
) {
  const barCount = 40;
  const gap = 3;
  const barWidth = (width - gap * (barCount - 1)) / barCount;
  const centerY = height / 2;

  const time = Date.now() / 1000;
  for (let i = 0; i < barCount; i++) {
    const wave = Math.sin(time * 1.5 + i * 0.3) * 0.15 + 0.2;
    const barHeight = Math.max(3, wave * height * 0.3);
    const x = i * (barWidth + gap);
    const y = centerY - barHeight / 2;

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
