import { useRef, useEffect } from 'react';

export type DrawLoop = () => void;
export type Sketch = (props: { ctx: CanvasRenderingContext2D; canvas: HTMLCanvasElement }) => DrawLoop;

interface CanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  width?: number;
  height?: number;
  density?: number;
  className?: string;
  sketch: Sketch;
}

export default function Canvas({ width = 200, height = 200, density = 2, sketch, ...canvasProps }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sketchRef = useRef<Sketch>(sketch);

  useEffect(() => {
    sketchRef.current = sketch;
  });

  useEffect(() => {
    let loop: DrawLoop;
    if (canvasRef.current != null) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        loop = sketchRef.current({ canvas: canvasRef.current, ctx });
      }
    } else {
      loop = () => () => undefined;
    }
    const render = () => {
      loop();
      requestAnimationFrame(render);
    };
    render();
  }, []);

  return (
    <canvas
      {...canvasProps}
      ref={canvasRef}
      width={width * density}
      height={height * density}
      style={{ width: width, height: height }}
    />
  );
}
