import PptxGenJS from 'pptxgenjs'
import { Slide } from '../types'

// Slide dimensions in inches (16:9)
const W = 10
const H = 5.625

// Layout ratios (match SlideCanvas)
const TEXT_RATIO = 0.55
const IMG_RATIO = 0.45

// Padding in inches — scaled to match new SlideCanvas padH=56px, padV=48/20px
// 56px / 1280px * 10in ≈ 0.44in   48px / 720px * 5.625in ≈ 0.375in
const PAD_H = 0.44
const PAD_V_TOP_FULL = 0.375   // text-only / fullscreen: padTop=48px
const PAD_V_TOP_SPLIT = 0.155  // image-left/right: padTop=20px (reduced)
const PAD_V_BOTTOM = 0.375     // padBottom=48px for all layouts

// Title block height in inches (matches 40px title + 21px margin + 2px line + 21px gap)
const TITLE_H = 0.95

// Font sizes in pt (proportional to new px sizes: 40/22/16/14px)
const FONT_TITLE = 32
const FONT_SUBTITLE = 18
const FONT_CONTENT = 13
const FONT_PAGENUM = 10

type PptxSlide = ReturnType<PptxGenJS['addSlide']>

function addDarkRect(
  slide: PptxSlide,
  x: number,
  y: number,
  w: number,
  h: number,
  color = '16213e',
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  slide.addShape('rect' as any, {
    x, y, w, h,
    fill: { color },
    line: { color, width: 0 },
  })
}

function addOverlayRect(slide: PptxSlide) {
  // Bottom 45% overlay matching image-fullscreen layout
  const overlayH = H * 0.45
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  slide.addShape('rect' as any, {
    x: 0,
    y: H - overlayH,
    w: W,
    h: overlayH,
    fill: { color: '000000', transparency: 30 },
    line: { color: '000000', width: 0 },
  })
}

function addPageNumber(
  slide: PptxSlide,
  current: number,
  total: number,
  x: number,
) {
  slide.addText(`${current} / ${total}`, {
    x,
    y: H - 0.32,
    w: 1.5,
    h: 0.28,
    fontSize: FONT_PAGENUM,
    color: 'AAAAAA',
  })
}

function buildTextRuns(slideData: Slide): PptxGenJS.TextProps[] {
  const runs: PptxGenJS.TextProps[] = []

  slideData.sections.forEach((section, i) => {
    if (i > 0) {
      // Space between sections
      runs.push({ text: ' ', options: { breakLine: true, fontSize: 5 } })
    }
    runs.push({
      text: section.subtitle,
      options: {
        fontSize: FONT_SUBTITLE,
        bold: true,
        color: '64b5f6',
        breakLine: true,
        paraSpaceBefore: 2,
      },
    })
    section.content.forEach((line) => {
      runs.push({
        text: `\u00b7 ${line}`,
        options: {
          fontSize: FONT_CONTENT,
          color: 'e0e0e0',
          breakLine: true,
        },
      })
    })
  })

  return runs
}

function addSlideContent(
  slide: PptxSlide,
  slideData: Slide,
  textX: number,
  textW: number,
  padTop: number,
  pageNum: number,
  total: number,
) {
  const innerW = textW - PAD_H * 2
  const contentX = textX + PAD_H

  // Title
  slide.addText(slideData.title, {
    x: contentX,
    y: padTop,
    w: innerW,
    h: TITLE_H,
    fontSize: FONT_TITLE,
    bold: true,
    color: 'FFFFFF',
    valign: 'middle',
    wrap: true,
  })

  // Sections content block
  const runs = buildTextRuns(slideData)
  if (runs.length > 0) {
    const sectionsY = padTop + TITLE_H + 0.08
    const sectionsH = H - sectionsY - PAD_V_BOTTOM

    slide.addText(runs, {
      x: contentX,
      y: sectionsY,
      w: innerW,
      h: sectionsH,
      valign: 'top',
      wrap: true,
    })
  }

  addPageNumber(slide, pageNum, total, contentX)
}

export async function exportToPptx(slides: Slide[]): Promise<void> {
  const pptx = new PptxGenJS()

  pptx.defineLayout({ name: 'WIDE_16_9', width: W, height: H })
  pptx.layout = 'WIDE_16_9'

  for (let i = 0; i < slides.length; i++) {
    const slideData = slides[i]
    const pptxSlide = pptx.addSlide()

    if (slideData.layout === 'text-only') {
      pptxSlide.background = { fill: '1a1a2e' }
      // 88% content width, centered
      const marginX = W * 0.06
      const contentW = W * 0.88
      addSlideContent(
        pptxSlide, slideData,
        marginX, contentW,
        PAD_V_TOP_FULL,
        i + 1, slides.length,
      )
    }

    else if (slideData.layout === 'image-right') {
      const textW = W * TEXT_RATIO
      const imgX = textW
      const imgW = W * IMG_RATIO

      addDarkRect(pptxSlide, 0, 0, textW, H)
      if (slideData.imageUrl) {
        pptxSlide.addImage({ path: slideData.imageUrl, x: imgX, y: 0, w: imgW, h: H })
      }
      addSlideContent(
        pptxSlide, slideData,
        0, textW,
        PAD_V_TOP_SPLIT,
        i + 1, slides.length,
      )
    }

    else if (slideData.layout === 'image-left') {
      const imgW = W * IMG_RATIO
      const textX = imgW
      const textW = W * TEXT_RATIO

      if (slideData.imageUrl) {
        pptxSlide.addImage({ path: slideData.imageUrl, x: 0, y: 0, w: imgW, h: H })
      }
      addDarkRect(pptxSlide, textX, 0, textW, H)
      addSlideContent(
        pptxSlide, slideData,
        textX, textW,
        PAD_V_TOP_SPLIT,
        i + 1, slides.length,
      )
    }

    else if (slideData.layout === 'image-fullscreen') {
      if (slideData.imageUrl) {
        pptxSlide.addImage({ path: slideData.imageUrl, x: 0, y: 0, w: W, h: H })
      }
      addOverlayRect(pptxSlide)

      // Text sits in the bottom 45% overlay area
      const overlayH = H * 0.45
      const overlayY = H - overlayH
      const marginX = W * 0.06
      const contentW = W * 0.88

      // Title inside overlay
      pptxSlide.addText(slideData.title, {
        x: marginX + PAD_H,
        y: overlayY + 0.2,
        w: contentW - PAD_H * 2,
        h: TITLE_H * 0.85,
        fontSize: FONT_TITLE,
        bold: true,
        color: 'FFFFFF',
        valign: 'middle',
        wrap: true,
      })

      // Sections inside overlay
      const runs = buildTextRuns(slideData)
      if (runs.length > 0) {
        const sectionsY = overlayY + 0.2 + TITLE_H * 0.85 + 0.05
        pptxSlide.addText(runs, {
          x: marginX + PAD_H,
          y: sectionsY,
          w: contentW - PAD_H * 2,
          h: H - sectionsY - 0.3,
          valign: 'top',
          wrap: true,
        })
      }

      addPageNumber(pptxSlide, i + 1, slides.length, marginX + PAD_H)
    }
  }

  const timestamp = Date.now()
  await pptx.writeFile({ fileName: `ppt-export-${timestamp}.pptx` })
}
