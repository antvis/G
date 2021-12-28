/* eslint-disable react-hooks/exhaustive-deps */
import type { CanvasConfig } from '@antv/g';
import { Canvas as GCanvas } from '@antv/g';
import React, { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import type { FiberRoot } from 'react-reconciler';
import { reconsiler } from './reconciler';
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

      container.current = reconsiler.createContainer(canvas as any, 0, false, null);
      // reconsiler.updateContainer(children, container.current, null);

      return () => {
        reconsiler.updateContainer(null, container.current, null);
      };

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (container.current) {
        reconsiler.updateContainer(children, container.current, null);
      }
    }, [children]);

    useEffect(() => {
      canvasRef.current?.setRenderer(renderer);
    }, [renderer]);

    useEffect(() => {
      canvasRef.current?.setCursor(cursor);
    }, [cursor]);

    useEffect(() => {
      canvasRef.current.resize(width, height);
    }, [width, height]);

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
