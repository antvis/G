import type { CanvasConfig } from '@antv/g';
import { Canvas as GCanvas } from '@antv/g';
import React, { forwardRef, useLayoutEffect, useRef } from 'react';
import type { FiberRoot } from 'react-reconciler';
import { reconcilor } from './reconciler';
import { assertRef } from './util';

export interface CanvasProps extends CanvasConfig {
  classname?: string;
  role?: string;
  style?: React.CSSProperties;
  tabIndex?: number;
  title?: string;
}

export const Canvas = forwardRef<GCanvas, CanvasProps>(
  (
    { children, classname, role, style, tabIndex, title, renderer, width, height, capture, cursor },
    ref,
  ) => {
    assertRef(ref);
    const container = useRef<FiberRoot>();

    const divRef = useRef<HTMLDivElement>(null);

    const innerCanvasRef = useRef<GCanvas>(null);

    const canvasRef = ref || innerCanvasRef;

    useLayoutEffect(() => {
      const canvas = new GCanvas({
        renderer,
        width,
        height,
        capture,
        cursor,
        container: divRef.current,
      });

      canvasRef.current = canvas;

      container.current = reconcilor.createContainer(canvas as any, 1, false, null);

      return () => {
        reconcilor.updateContainer(null, container.current, null);
      };

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useLayoutEffect(() => {
      if (container.current) {
        reconcilor.updateContainer(children, container.current, null);
      }
    }, [children]);

    useLayoutEffect(() => {
      canvasRef.current?.setRenderer(renderer);
    }, [canvasRef, renderer]);

    useLayoutEffect(() => {
      canvasRef.current?.setCursor(cursor);
    }, [canvasRef, cursor]);

    useLayoutEffect(() => {
      canvasRef.current.resize(width, height);
    }, [width, height, canvasRef]);

    return (
      <div
        ref={divRef}
        className={classname}
        role={role}
        style={style}
        tabIndex={tabIndex}
        title={title}
      />
    );
  },
);
