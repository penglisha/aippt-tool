import { useLayoutEffect, useRef, useState, CSSProperties } from 'react'
import { Slide } from '../types'
import {
  FontState,
  DEFAULT_FONT_STATE,
  adjustFontState,
  OVERFLOW_ITEM_THRESHOLD,
} from '../utils/layoutEngine'

interface Props {
  slide: Slide
  slideIndex: number
  total: number
}

const FONT_FAMILY =
  "'Segoe UI', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif"

// Title font size (fixed, not scaled)
const TITLE_SIZE = 40
// Default page-number font size
const PAGE_NUM_SIZE = 14

export function SlideCanvas({ slide, slideIndex, total }: Props) {
  const [fs, setFs] = useState<FontState>(DEFAULT_FONT_STATE)
  const sectionsRef = useRef<HTMLDivElement>(null)
  const prevKeyRef = useRef('')

  const slideKey = `${slideIndex}::${slide.title}::${slide.layout}`

  // Count total 3rd-level content items across all sections
  const totalContentItems = slide.sections.reduce(
    (sum, s) => sum + s.content.length,
    0,
  )

  useLayoutEffect(() => {
    // Reset when the displayed slide changes
    if (prevKeyRef.current !== slideKey) {
      prevKeyRef.current = slideKey
      setFs(DEFAULT_FONT_STATE)
      return
    }

    // Keep big fonts when content is sparse — only reduce when items > threshold
    if (totalContentItems <= OVERFLOW_ITEM_THRESHOLD) return

    const el = sectionsRef.current
    if (!el) return
    if (el.scrollHeight <= el.clientHeight + 2) return

    const next = adjustFontState(fs)
    if (next) setFs(next)
  }, [slideKey, fs, totalContentItems])

  // ── Shared rendering helpers ────────────────────────────────────────────
  // These are plain functions returning JSX (not React components),
  // so React never remounts them and refs stay stable.

  const renderSections = () => (
    <div
      ref={sectionsRef}
      style={{
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        columnCount: fs.columns > 1 ? 2 : undefined,
        columnGap: fs.columns > 1 ? '28px' : undefined,
      }}
    >
      {slide.sections.map((section, i) => (
        <div
          key={i}
          style={{
            breakInside: 'avoid',
            marginBottom: 20,
            borderLeft: '3px solid #64b5f6',
            paddingLeft: 10,
          }}
        >
          {/* 二级标题 */}
          <div
            style={{
              fontSize: fs.subtitleSize,
              fontWeight: 600,
              color: '#64b5f6',
              lineHeight: 1.3,
              marginBottom: 8,
            }}
          >
            {section.subtitle}
          </div>

          {/* 三级内容 */}
          {section.content.map((line, j) => (
            <div
              key={j}
              style={{
                fontSize: fs.fontSize,
                color: '#e0e0e0',
                lineHeight: 1.6,
                display: 'flex',
                alignItems: 'baseline',
                gap: 5,
              }}
            >
              <span style={{ color: '#64b5f6', flexShrink: 0 }}>·</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )

  /**
   * Renders a text panel (title + separator + sections + page number).
   * padTop / padBottom allow independent vertical padding control.
   */
  const renderTextPanel = (
    width: number,
    height: number,
    padH: number,
    padTop: number,
    padBottom: number,
  ) => (
    <div
      style={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        paddingTop: padTop,
        paddingBottom: padBottom,
        paddingLeft: padH,
        paddingRight: padH,
        boxSizing: 'border-box',
        position: 'relative',
        fontFamily: FONT_FAMILY,
      }}
    >
      {/* 一级标题 */}
      <div
        style={{
          fontSize: TITLE_SIZE,
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: 1.2,
          marginBottom: 10,
          flexShrink: 0,
        }}
      >
        {slide.title}
      </div>

      {/* 标题下方渐变分隔线 */}
      <div
        style={{
          height: 2,
          background: 'linear-gradient(to right, #64b5f6 0%, transparent 100%)',
          borderRadius: 1,
          marginBottom: 21,
          flexShrink: 0,
        }}
      />

      {/* 二三级内容 */}
      {renderSections()}

      {/* 页码 */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: padH,
          fontSize: PAGE_NUM_SIZE,
          color: 'rgba(255,255,255,0.45)',
          fontFamily: 'monospace',
          userSelect: 'none',
        }}
      >
        {slideIndex + 1} / {total}
      </div>
    </div>
  )

  // ── Layout renderers ────────────────────────────────────────────────────

  const canvasBase: CSSProperties = {
    width: 1280,
    height: 720,
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
  }

  // ── text-only ──
  if (slide.layout === 'text-only') {
    const contentW = Math.round(1280 * 0.88) // 88% width
    return (
      <div
        style={{
          ...canvasBase,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {renderTextPanel(contentW, 680, 56, 48, 48)}
      </div>
    )
  }

  // ── image-right (text left 55%, image right 45%) ──
  if (slide.layout === 'image-right') {
    const textW = Math.round(1280 * 0.55)
    const imgW = 1280 - textW
    return (
      <div style={{ ...canvasBase, display: 'flex' }}>
        <div style={{ width: textW, height: 720, background: '#16213e', flexShrink: 0 }}>
          {renderTextPanel(textW, 720, 56, 20, 48)}
        </div>
        <div style={{ width: imgW, height: 720, overflow: 'hidden', flexShrink: 0 }}>
          {slide.imageUrl && (
            <img
              src={slide.imageUrl}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>
      </div>
    )
  }

  // ── image-left (image left 45%, text right 55%) ──
  if (slide.layout === 'image-left') {
    const imgW = Math.round(1280 * 0.45)
    const textW = 1280 - imgW
    return (
      <div style={{ ...canvasBase, display: 'flex' }}>
        <div style={{ width: imgW, height: 720, overflow: 'hidden', flexShrink: 0 }}>
          {slide.imageUrl && (
            <img
              src={slide.imageUrl}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>
        <div style={{ width: textW, height: 720, background: '#16213e', flexShrink: 0 }}>
          {renderTextPanel(textW, 720, 56, 20, 48)}
        </div>
      </div>
    )
  }

  // ── image-fullscreen (image full, text overlay bottom 45%) ──
  if (slide.layout === 'image-fullscreen') {
    const overlayH = Math.round(720 * 0.45) // 324px
    return (
      <div style={{ ...canvasBase }}>
        {/* Background image */}
        {slide.imageUrl && (
          <img
            src={slide.imageUrl}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}

        {/* Bottom overlay — 45% height */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: overlayH,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.78) 30%)',
          }}
        >
          {renderTextPanel(1280, overlayH, 56, 24, 24)}
        </div>
      </div>
    )
  }

  return null
}
