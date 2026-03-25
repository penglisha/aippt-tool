interface Props {
  value: string
  onChange: (value: string) => void
  slideCount: number
  onGenerate: () => void
}

export function Editor({ value, onChange, slideCount, onGenerate }: Props) {
  const charCount = value.length
  const lineCount = value.split('\n').length

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#12121f',
        borderRight: '1px solid #2a2a3e',
      }}
    >
      {/* ── Toolbar ──────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid #2a2a3e',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#c8b8ff',
              letterSpacing: '-0.01em',
            }}
          >
            PPT 生成器
          </span>
        </div>

        <button
          onClick={onGenerate}
          style={{
            padding: '8px 20px',
            borderRadius: 7,
            border: 'none',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.02em',
            boxShadow: '0 2px 12px rgba(124,58,237,0.4)',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          ✦ 生成预览
        </button>
      </div>

      {/* ── Textarea ─────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          placeholder={PLACEHOLDER}
          style={{
            width: '100%',
            height: '100%',
            padding: '18px 20px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#d4d4d4',
            fontSize: 13,
            lineHeight: 1.7,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
            resize: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* ── Status bar ───────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 20px',
          borderTop: '1px solid #2a2a3e',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 11, color: '#555577' }}>
          {charCount} 字符 · {lineCount} 行
        </span>
        <span
          style={{
            fontSize: 11,
            color: slideCount > 0 ? '#7c6fcd' : '#555577',
            fontWeight: slideCount > 0 ? 600 : 400,
          }}
        >
          {slideCount > 0 ? `共 ${slideCount} 页` : '未生成'}
        </span>
      </div>
    </div>
  )
}

const PLACEHOLDER = `# 公司介绍
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
