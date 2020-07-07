import { useRef, useEffect } from 'react';

export type Config = { cleanup: () => void | null };
export type DrawLoop = () => void;
export type Sketch = (props: { ctx: CanvasRenderingContext2D; canvas: HTMLCanvasElement; config: Config }) => DrawLoop;

interface CanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  width?: number;
  height?: number;
  density?: number;
  className?: string;
  sketch: Sketch;
}

export default function Canvas({ width = 200, height = 200, density = 2, sketch, ...canvasProps }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const configRef = useRef<Config>({ cleanup: () => undefined });

  useEffect(() => {
    let loop: DrawLoop;
    let cleanup: Config['cleanup'] = () => undefined;
    let rAf: null | number = null;
    if (canvasRef.current != null) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        loop = sketch({ canvas: canvasRef.current, ctx, config: configRef.current });
        cleanup = configRef.current.cleanup;
      }
    } else {
      loop = () => undefined;
    }
    const render = () => {
      loop();
      rAf = requestAnimationFrame(render);
    };
    render();
    return () => {
      cleanup();
      if (typeof rAf == 'number') {
        cancelAnimationFrame(rAf);
      }
    };
  }, [sketch, width, height]);

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
