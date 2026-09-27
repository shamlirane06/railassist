import { useCallback, useEffect, useRef, useState } from 'react'

const MAP_W = 900
const MAP_H = 620
const EDGE = 24
const MAX_SCALE = 3
const DRAG_THRESHOLD = 6
const TWEEN_MS = 280

function fitScale(size, inset) {
  return Math.min(size.w / (MAP_W + EDGE * 2), Math.max(1, size.h - inset) / (MAP_H + EDGE * 2))
}

function clampAxis(center, span, total) {
  if (span >= total + EDGE * 2) return total / 2
  return Math.min(total - span / 2 + EDGE, Math.max(span / 2 - EDGE, center))
}

function clampCam(cam, size, inset) {
  const s = Math.min(MAX_SCALE, Math.max(fitScale(size, inset), cam.s))
  const visW = size.w / s
  const visH = Math.max(1, size.h - inset) / s
  return { s, x: clampAxis(cam.x, visW, MAP_W), y: clampAxis(cam.y, visH, MAP_H) }
}

function defaultScale(size, inset) {
  return Math.max(fitScale(size, inset), Math.min(1.1, size.w / 340))
}

const easeOut = t => 1 - (1 - t) ** 3

/**
 * Camera for the indoor map. `x`/`y` is the map point shown at the centre of the
 * visible area (the stage minus whatever the bottom sheet covers), `s` is px per map unit.
 */
export function useMapCamera({ occluderRef, home }) {
  const stageRef = useRef(null)
  const [size, setSize] = useState(null)
  const [inset, setInset] = useState(0)
  const [cam, setCam] = useState(null)

  const live = useRef({ size: null, inset: 0, cam: null })
  live.current = { size, inset, cam }

  const tween = useRef(0)
  const focusTarget = useRef(null)
  const pointers = useRef(new Map())
  const gesture = useRef({ moved: false, origin: null })

  const stopTween = () => cancelAnimationFrame(tween.current)

  const animateTo = useCallback(target => {
    const { size: sz, inset: ins, cam: from } = live.current
    if (!sz) return
    const to = clampCam(target, sz, ins)
    stopTween()
    if (!from || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCam(to)
      return
    }
    const start = performance.now()
    const step = now => {
      const t = easeOut(Math.min(1, (now - start) / TWEEN_MS))
      setCam({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t, s: from.s + (to.s - from.s) * t })
      if (t < 1) tween.current = requestAnimationFrame(step)
    }
    tween.current = requestAnimationFrame(step)
  }, [])

  const update = useCallback(fn => {
    const { size: sz, inset: ins } = live.current
    if (!sz) return
    setCam(prev => (prev ? clampCam(fn(prev), sz, ins) : prev))
  }, [])

  const zoomAt = useCallback((factor, ax, ay) => {
    update(prev => {
      const { size: sz, inset: ins } = live.current
      const px = ax ?? sz.w / 2
      const py = ay ?? (sz.h - ins) / 2
      const next = Math.min(MAX_SCALE, Math.max(fitScale(sz, ins), prev.s * factor))
      const x0 = prev.x - sz.w / 2 / prev.s
      const y0 = prev.y - (sz.h - ins) / 2 / prev.s
      const mx = x0 + px / prev.s
      const my = y0 + py / prev.s
      return { s: next, x: mx - px / next + sz.w / 2 / next, y: my - py / next + (sz.h - ins) / 2 / next }
    })
  }, [update])

  const focus = useCallback((point, { minScale } = {}) => {
    const { size: sz, cam: current } = live.current
    focusTarget.current = { point, minScale }
    if (!sz) return
    const s = Math.max(current?.s ?? 0, minScale ?? sz.w / 300)
    animateTo({ x: point.x, y: point.y, s })
  }, [animateTo])

  const zoomBy = useCallback(factor => {
    const { size: sz, cam: current } = live.current
    if (!sz || !current) return
    focusTarget.current = null
    animateTo({ ...current, s: current.s * factor })
  }, [animateTo])

  const overview = useCallback(() => {
    const { size: sz, inset: ins } = live.current
    if (!sz) return
    focusTarget.current = null
    animateTo({ x: MAP_W / 2, y: MAP_H / 2, s: fitScale(sz, ins) })
  }, [animateTo])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const measure = () => {
      const stageRect = stage.getBoundingClientRect()
      const occluder = occluderRef?.current
      const covered = occluder ? Math.max(0, stageRect.bottom - occluder.getBoundingClientRect().top + 8) : 0
      setSize({ w: stageRect.width, h: stageRect.height })
      setInset(Math.min(covered, stageRect.height * 0.6))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    if (occluderRef?.current) observer.observe(occluderRef.current)
    return () => observer.disconnect()
  }, [occluderRef])

  useEffect(() => {
    if (!size) return
    if (!live.current.cam) {
      const target = focusTarget.current
      const initialCam = target
        ? {
            x: target.point.x,
            y: target.point.y,
            s: Math.max(defaultScale(size, inset), target.minScale ?? size.w / 300),
          }
        : { x: home.x, y: home.y, s: defaultScale(size, inset) }
      setCam(clampCam(initialCam, size, inset))
      return
    }
    if (focusTarget.current) {
      const { point, minScale } = focusTarget.current
      animateTo({ x: point.x, y: point.y, s: Math.max(live.current.cam.s, minScale ?? 0) })
    } else {
      setCam(prev => clampCam(prev, size, inset))
    }
  }, [size, inset, home.x, home.y, animateTo])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const onWheel = event => {
      event.preventDefault()
      stopTween()
      focusTarget.current = null
      const rect = stage.getBoundingClientRect()
      zoomAt(Math.exp(-event.deltaY * 0.0015), event.clientX - rect.left, event.clientY - rect.top)
    }
    stage.addEventListener('wheel', onWheel, { passive: false })
    return () => stage.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  useEffect(() => () => stopTween(), [])

  const localPoint = event => {
    const rect = stageRef.current.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const onPointerDown = event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const point = localPoint(event)
    pointers.current.set(event.pointerId, point)
    if (pointers.current.size === 1) gesture.current = { moved: false, origin: point }
    stopTween()
  }

  const onPointerMove = event => {
    const prev = pointers.current.get(event.pointerId)
    if (!prev) return
    const point = localPoint(event)
    pointers.current.set(event.pointerId, point)

    if (pointers.current.size === 1) {
      const { origin } = gesture.current
      if (!gesture.current.moved && Math.hypot(point.x - origin.x, point.y - origin.y) < DRAG_THRESHOLD) return
      if (!gesture.current.moved) {
        gesture.current.moved = true
        focusTarget.current = null
        stageRef.current.setPointerCapture?.(event.pointerId)
      }
      update(c => ({ ...c, x: c.x - (point.x - prev.x) / c.s, y: c.y - (point.y - prev.y) / c.s }))
      return
    }

    if (pointers.current.size === 2) {
      gesture.current.moved = true
      focusTarget.current = null
      const [other] = [...pointers.current.entries()].filter(([id]) => id !== event.pointerId).map(([, p]) => p)
      const before = Math.hypot(prev.x - other.x, prev.y - other.y)
      const after = Math.hypot(point.x - other.x, point.y - other.y)
      if (before > 0) zoomAt(after / before, (point.x + other.x) / 2, (point.y + other.y) / 2)
    }
  }

  const onPointerEnd = event => {
    pointers.current.delete(event.pointerId)
  }

  const onClickCapture = event => {
    if (gesture.current.moved) {
      event.stopPropagation()
      event.preventDefault()
      gesture.current.moved = false
    }
  }

  const viewBox = cam && size
    ? (() => {
        const w = size.w / cam.s
        const h = size.h / cam.s
        const x0 = cam.x - w / 2
        const y0 = cam.y - (size.h - inset) / 2 / cam.s
        return `${x0} ${y0} ${w} ${h}`
      })()
    : `0 0 ${MAP_W} ${MAP_H}`

  const canZoomIn = cam ? cam.s < MAX_SCALE - 0.01 : true
  const canZoomOut = cam && size ? cam.s > fitScale(size, inset) + 0.01 : true

  return {
    stageRef,
    viewBox,
    ready: Boolean(cam),
    canZoomIn,
    canZoomOut,
    zoomIn: () => zoomBy(1.4),
    zoomOut: () => zoomBy(1 / 1.4),
    overview,
    focus,
    stageHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
      onClickCapture,
    },
  }
}
