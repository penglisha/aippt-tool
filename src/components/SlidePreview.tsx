import { useEffect, useRef, useState } from 'react'
import { Slide } from '../types'
import { SlideCanvas } from './SlideCanvas'
import { exportToPptx } from '../utils/exporter'

interface Props {
  slides: Slide[]
  currentIndex: number
  onNavigate: (index: number) => void
}

export function SlidePreview({ slides, currentIndex, onNavigate }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)
  const [exporting, setExporting] = useState(false)

  // Dynamically compute scale based on container width
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      const availW = el.clientWidth - 48 // horizontal padding
      const availH = el.clientHeight - 48 // vertical padding
      const scaleByW = availW / 1280
      const scaleByH = availH / 720
      setScale(Math.min(scaleByW, scaleByH, 1))
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const handleExport = async () => {
    if (exporting || slides.length === 0) return
    setExporting(true)
    try {
      await exportToPptx(slides)
    } catch (err) {
      console.error('Export failed:', err)
      alert('导出失败，请查看控制台')
    } finally {
      setExporting(false)
    }
  }

  const canPrev = currentIndex > 0
  const canNext = currentIndex < slides.length - 1
  const slide = slides[currentIndex]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0f0f1a',
        borderLeft: '1px solid #2a2a3e',
      }}
    >
      {/* ── Top nav bar ─────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '12px 24px',
          borderBottom: '1px solid #2a2a3e',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => canPrev && onNavigate(currentIndex - 1)}
          disabled={!canPrev || slides.length === 0}
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            border: 'none',
            background: canPrev ? '#2a2a4e' : '#1a1a2e',
            color: canPrev ? '#ffffff' : '#444466',
            fontSize: 18,
            cursor: canPrev ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s',
          }}
        >
          ‹
        </button>

        <span
          style={{
            fontSize: 14,
            color: '#a0a0c0',
            minWidth: 80,
            textAlign: 'center',
            fontFamily: 'monospace',
          }}
        >
          {slides.length > 0 ? `${currentIndex + 1} / ${slides.length}` : '— / —'}
        </span>

        <button
          onClick={() => canNext && onNavigate(currentIndex + 1)}
          disabled={!canNext || slides.length === 0}
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            border: 'none',
            background: canNext ? '#2a2a4e' : '#1a1a2e',
            color: canNext ? '#ffffff' : '#444466',
            fontSize: 18,
            cursor: canNext ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s',
          }}
        >
          ›
        </button>
      </div>

      {/* ── Preview canvas area ──────────────────────── */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          overflow: 'hidden',
        }}
      >
        {slide ? (
          <div
            style={{
              width: Math.round(1280 * scale),
              height: Math.round(720 * scale),
              position: 'relative',
              flexShrink: 0,
              boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              <SlideCanvas
                slide={slide}
                slideIndex={currentIndex}
                total={slides.length}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              color: '#444466',
              fontSize: 14,
              textAlign: 'center',
              lineHeight: 2,
            }}
          >
            在左侧输入文案后点击「生成预览」
          </div>
        )}
      </div>

      {/* ── Bottom export button ─────────────────────── */}
      <div
        style={{
          padding: '14px 24px',
          borderTop: '1px solid #2a2a3e',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={handleExport}
          disabled={exporting || slides.length === 0}
          style={{
            padding: '10px 32px',
            borderRadius: 8,
            border: 'none',
            background:
              slides.length === 0
                ? '#1e1e3a'
                : exporting
                  ? '#2a2a5a'
                  : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: slides.length === 0 ? '#444466' : '#ffffff',
            fontSize: 14,
            fontWeight: 600,
            cursor: slides.length === 0 || exporting ? 'not-allowed' : 'pointer',
            letterSpacing: '0.02em',
            transition: 'opacity 0.15s',
          }}
        >
          {exporting ? '正在导出…' : '导出 .pptx'}
        </button>
      </div>
    </div>
  )
}
