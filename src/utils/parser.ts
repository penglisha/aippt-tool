import { Slide, Section, Layout } from '../types'

const LAYOUT_CYCLE: Layout[] = [
  'text-only',
  'image-right',
  'image-left',
  'image-fullscreen',
]

// Map Chinese keywords to English seed words for Unsplash
const TITLE_MAP: [string, string][] = [
  ['公司', 'company'],
  ['企业', 'company'],
  ['介绍', 'introduction'],
  ['产品', 'product'],
  ['优势', 'advantage'],
  ['团队', 'team'],
  ['技术', 'technology'],
  ['服务', 'service'],
  ['市场', 'market'],
  ['未来', 'future'],
  ['战略', 'strategy'],
  ['数据', 'data'],
  ['创新', 'innovation'],
  ['客户', 'customer'],
  ['合作', 'cooperation'],
  ['发展', 'development'],
  ['销售', 'sales'],
  ['财务', 'finance'],
  ['运营', 'operation'],
  ['品牌', 'brand'],
  ['用户', 'user'],
  ['平台', 'platform'],
  ['解决方案', 'solution'],
  ['行业', 'industry'],
  ['竞争', 'competition'],
  ['增长', 'growth'],
  ['收入', 'revenue'],
  ['目标', 'goal'],
  ['愿景', 'vision'],
  ['使命', 'mission'],
  ['文化', 'culture'],
  ['案例', 'case'],
  ['项目', 'project'],
  ['计划', 'plan'],
  ['总结', 'summary'],
]

function getSeedWord(title: string): string {
  for (const [chinese, english] of TITLE_MAP) {
    if (title.includes(chinese)) return english
  }
  // Try to extract an existing English word from title
  const englishMatch = title.match(/[a-zA-Z]+/)
  if (englishMatch) return englishMatch[0].toLowerCase()
  // Fallback
  return 'business'
}

export function parseMarkdown(markdown: string): Slide[] {
  // Split pages by '---' on its own line
  const pages = markdown
    .split(/^---\s*$/m)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

  return pages.map((page, index) => {
    const lines = page.split('\n')
    let title = ''
    const sections: Section[] = []
    let currentSection: Section | null = null

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      if (trimmed.startsWith('# ')) {
        title = trimmed.slice(2).trim()
      } else if (trimmed.startsWith('## ')) {
        if (currentSection) sections.push(currentSection)
        currentSection = { subtitle: trimmed.slice(3).trim(), content: [] }
      } else if (currentSection) {
        currentSection.content.push(trimmed)
      }
    }
    if (currentSection) sections.push(currentSection)

    const layout = LAYOUT_CYCLE[index % 4]
    const needsImage = layout !== 'text-only'
    const imageUrl = needsImage
      ? `https://picsum.photos/seed/${getSeedWord(title)}/1280/720`
      : undefined

    return { title, sections, layout, imageUrl }
  })
}
