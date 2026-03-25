import { useState, useCallback } from 'react'
import { Slide } from './types'
import { parseMarkdown } from './utils/parser'
import { Editor } from './components/Editor'
import { SlidePreview } from './components/SlidePreview'

const DEFAULT_TEXT = `# 公司介绍
## 我们是谁
成立于2018年，专注于AI领域
全球员工超过500人

## 核心业务
企业级AI解决方案
数据分析平台

---

# 产品优势
## 技术领先
自研大模型，性能业界前三
专利技术超过200项

## 服务完善
7x24小时技术支持
专属客户成功团队

---

# 未来规划
## 产品路线
Q3发布2.0版本
海外市场布局计划

## 战略合作
与头部云厂商深度合作
生态合作伙伴超过100家`

export default function App() {
  const [markdownText, setMarkdownText] = useState(DEFAULT_TEXT)
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleGenerate = useCallback(() => {
    const parsed = parseMarkdown(markdownText)
    setSlides(parsed)
    setCurrentIndex(0)
  }, [markdownText])

  const handleNavigate = useCallback(
    (index: number) => {
      if (index >= 0 && index < slides.length) {
        setCurrentIndex(index)
      }
    },
    [slides.length],
  )

  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#0c0c18',
      }}
    >
      {/* Left panel – 40% */}
      <div style={{ width: '40%', minWidth: 320, flexShrink: 0, height: '100%' }}>
        <Editor
          value={markdownText}
          onChange={setMarkdownText}
          slideCount={slides.length}
          onGenerate={handleGenerate}
        />
      </div>

      {/* Right panel – 60% */}
      <div style={{ flex: 1, minWidth: 0, height: '100%' }}>
        <SlidePreview
          slides={slides}
          currentIndex={currentIndex}
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  )
}
