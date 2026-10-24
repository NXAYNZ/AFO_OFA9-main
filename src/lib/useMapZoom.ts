import { PointerEvent as ReactPointerEvent, RefObject, useCallback, useEffect, useRef, useState } from 'react';

export interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const MAX_SCALE = 10;
// Pointer travel (px) before a press counts as a drag instead of a click
const DRAG_THRESHOLD = 5;
const ANIMATION_MS = 350;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Zoom & pan for an SVG by animating its viewBox: wheel / pinch / drag plus programmatic zoomBy / zoomToBounds.
 * Province clicks should call consumeDrag() first so ending a pan does not open a province.
 */
export const useMapZoom = (svgRef: RefObject<SVGSVGElement | null>, baseW: number, baseH: number) => {
  const base: ViewBox = { x: 0, y: 0, w: baseW, h: baseH };
  const [view, setViewState] = useState<ViewBox>(base);
  const viewRef = useRef<ViewBox>(base);
  const frameRef = useRef<number | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ moved: 0, dragged: false, pinchDist: 0 });

  // Keep the view's centre on the map and the zoom level within limits
  const clamp = useCallback(
    (v: ViewBox): ViewBox => {
      const w = Math.min(baseW, Math.max(baseW / MAX_SCALE, v.w));
      const h = (w * baseH) / baseW;
      const cx = Math.min(baseW, Math.max(0, v.x + v.w / 2));
      const cy = Math.min(baseH, Math.max(0, v.y + v.h / 2));
      return { x: cx - w / 2, y: cy - h / 2, w, h };
    },
    [baseW, baseH]
  );

  const setView = useCallback(
    (v: ViewBox) => {
      const next = clamp(v);
      viewRef.current = next;
      setViewState(next);
    },
    [clamp]
  );

  const stopAnimation = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  };

  const animateTo = useCallback(
    (target: ViewBox) => {
      stopAnimation();
      const from = viewRef.current;
      const to = clamp(target);
      const start = performance.now();
      const step = (now: number) => {
        const t = easeOut(Math.min(1, (now - start) / ANIMATION_MS));
        setView({
          x: from.x + (to.x - from.x) * t,
          y: from.y + (to.y - from.y) * t,
          w: from.w + (to.w - from.w) * t,
          h: from.h + (to.h - from.h) * t,
        });
        frameRef.current = t < 1 ? requestAnimationFrame(step) : null;
      };
      frameRef.current = requestAnimationFrame(step);
    },
    [clamp, setView]
  );

  // Client (screen) point -> SVG user coordinates for the current viewBox
  const toUser = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      const ctm = svg?.getScreenCTM();
      if (!svg || !ctm) return null;
      return new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    },
    [svgRef]
  );

  // Zoom by `factor` (>1 = in) keeping the user point `p` fixed on screen
  const zoomAround = useCallback(
    (factor: number, p: { x: number; y: number }, animate = false) => {
      const v = viewRef.current;
      const w = Math.min(baseW, Math.max(baseW / MAX_SCALE, v.w / factor));
      const ratio = w / v.w;
      const next = { x: p.x - (p.x - v.x) * ratio, y: p.y - (p.y - v.y) * ratio, w, h: v.h * ratio };
      if (animate) animateTo(next);
      else setView(next);
    },
    [animateTo, baseW, setView]
  );

  const zoomBy = useCallback(
    (factor: number) => {
      const v = viewRef.current;
      zoomAround(factor, { x: v.x + v.w / 2, y: v.y + v.h / 2 }, true);
    },
    [zoomAround]
  );

  const zoomToBounds = useCallback(
    (b: Bounds, padding = 0.08, maxScale = MAX_SCALE) => {
      const bw = b.maxX - b.minX;
      const bh = b.maxY - b.minY;
      // Fit the box inside the map's fixed aspect ratio, never zooming past maxScale
      const w = Math.max(Math.max(bw, (bh * baseW) / baseH) * (1 + padding * 2), baseW / maxScale);
      const h = (w * baseH) / baseW;
      animateTo({ x: b.minX + bw / 2 - w / 2, y: b.minY + bh / 2 - h / 2, w, h });
    },
    [animateTo, baseW, baseH]
  );

  // Centre on (cx, cy) at an exact zoom level
  const zoomToPoint = useCallback(
    (cx: number, cy: number, scale: number) => {
      const w = baseW / scale;
      const h = baseH / scale;
      animateTo({ x: cx - w / 2, y: cy - h / 2, w, h });
    },
    [animateTo, baseW, baseH]
  );

  const reset = useCallback(() => animateTo({ x: 0, y: 0, w: baseW, h: baseH }), [animateTo, baseW, baseH]);

  // Wheel needs a non-passive native listener so the page does not scroll while zooming
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      stopAnimation();
      const p = toUser(e.clientX, e.clientY);
      if (p) zoomAround(Math.exp(-e.deltaY * 0.0015), p);
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [svgRef, toUser, zoomAround]);

  useEffect(() => stopAnimation, []);

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    stopAnimation();
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) gesture.current = { moved: 0, dragged: false, pinchDist: 0 };
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      gesture.current.pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };

  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size >= 2) {
      const [a, b] = Array.from(pointers.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = toUser((a.x + b.x) / 2, (a.y + b.y) / 2);
      if (gesture.current.pinchDist > 0 && mid) zoomAround(dist / gesture.current.pinchDist, mid);
      gesture.current.pinchDist = dist;
      gesture.current.dragged = true;
      return;
    }

    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    gesture.current.moved += Math.abs(dx) + Math.abs(dy);
    if (!gesture.current.dragged && gesture.current.moved < DRAG_THRESHOLD) return;
    if (!gesture.current.dragged) {
      gesture.current.dragged = true;
      // Capture only once it is a real drag, so plain clicks still reach the province paths
      svg.setPointerCapture(e.pointerId);
    }
    const v = viewRef.current;
    setView({ ...v, x: v.x - dx / ctm.a, y: v.y - dy / ctm.d });
  };

  const onPointerUp = (e: ReactPointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current.pinchDist = 0;
  };

  // True (once) when the click that follows was really the end of a drag
  const consumeDrag = () => {
    const dragged = gesture.current.dragged;
    gesture.current.dragged = false;
    return dragged;
  };

  return {
    viewBox: `${view.x} ${view.y} ${view.w} ${view.h}`,
    scale: baseW / view.w,
    zoomBy,
    zoomToBounds,
    zoomToPoint,
    reset,
    consumeDrag,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  };
};
